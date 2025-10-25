import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'admin' ou 'member'
    const userId = searchParams.get('userId');

    if (type === 'admin') {
      // Statistiques pour les administrateurs
      const [
        usersSnapshot,
        formationsSnapshot,
        departmentsSnapshot,
        progressSnapshot,
        resultsSnapshot,
        videosSnapshot
      ] = await Promise.all([
        adminDb.collection('users').get(),
        adminDb.collection('formations').get(),
        adminDb.collection('departments').get(),
        adminDb.collection('userProgress').get(),
        adminDb.collection('evaluationResults').get(),
        adminDb.collection('videos').get()
      ]);

      const totalUsers = usersSnapshot.docs.length;
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().isActive).length;
      const totalFormations = formationsSnapshot.docs.length;
      const totalDepartments = departmentsSnapshot.docs.length;
      const totalVideos = videosSnapshot.docs.length;
      const totalProgress = progressSnapshot.docs.length;
      const completedFormations = progressSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
      const totalEvaluations = resultsSnapshot.docs.length;
      const averageScore = resultsSnapshot.docs.length > 0 
        ? resultsSnapshot.docs.reduce((sum, doc) => sum + doc.data().score, 0) / resultsSnapshot.docs.length 
        : 0;

      // Activités récentes (dernières 24h)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentProgress = progressSnapshot.docs.filter(doc => {
        const lastAccessed = doc.data().lastAccessedAt?.toDate();
        return lastAccessed && lastAccessed > yesterday;
      }).length;
      const recentEvaluations = resultsSnapshot.docs.filter(doc => {
        const completed = doc.data().completedAt?.toDate();
        return completed && completed > yesterday;
      }).length;

      // Statistiques par département
      const departmentStats = [];
      for (const deptDoc of departmentsSnapshot.docs) {
        const deptData = deptDoc.data();
        const deptUsers = usersSnapshot.docs.filter(doc => doc.data().departmentId === deptDoc.id);
        const deptProgress = progressSnapshot.docs.filter(doc => {
          const progressData = doc.data();
          const userDoc = usersSnapshot.docs.find(u => u.id === progressData.userId);
          return userDoc && userDoc.data().departmentId === deptDoc.id;
        });

        departmentStats.push({
          id: deptDoc.id,
          name: deptData.name,
          totalUsers: deptUsers.length,
          activeUsers: deptUsers.filter(doc => doc.data().isActive).length,
          totalProgress: deptProgress.length,
          completedFormations: deptProgress.filter(doc => doc.data().status === 'completed').length
        });
      }

      return NextResponse.json({
        overview: {
          totalUsers,
          activeUsers,
          totalFormations,
          totalDepartments,
          totalVideos,
          totalProgress,
          completedFormations,
          totalEvaluations,
          averageScore: Math.round(averageScore),
          recentProgress,
          recentEvaluations
        },
        departmentStats
      });
    } else if (type === 'member' && userId) {
      // Statistiques pour un membre spécifique
      const [
        userProgressSnapshot,
        userResultsSnapshot
      ] = await Promise.all([
        adminDb.collection('userProgress').where('userId', '==', userId).get(),
        adminDb.collection('evaluationResults').where('userId', '==', userId).get()
      ]);

      const totalFormations = userProgressSnapshot.docs.length;
      const completedFormations = userProgressSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
      const inProgressFormations = userProgressSnapshot.docs.filter(doc => doc.data().status === 'in-progress').length;
      const totalEvaluations = userResultsSnapshot.docs.length;
      const averageScore = userResultsSnapshot.docs.length > 0 
        ? userResultsSnapshot.docs.reduce((sum, doc) => sum + doc.data().score, 0) / userResultsSnapshot.docs.length 
        : 0;

      // Progrès par formation
      const formationProgress = [];
      for (const progressDoc of userProgressSnapshot.docs) {
        const progressData = progressDoc.data();
        const formationDoc = await adminDb.collection('formations').doc(progressData.formationId).get();
        
        if (formationDoc.exists) {
          formationProgress.push({
            formationId: progressData.formationId,
            title: formationDoc.data()?.title,
            status: progressData.status,
            progress: progressData.progress,
            lastAccessedAt: progressData.lastAccessedAt,
            completedAt: progressData.completedAt
          });
        }
      }

      return NextResponse.json({
        overview: {
          totalFormations,
          completedFormations,
          inProgressFormations,
          totalEvaluations,
          averageScore: Math.round(averageScore)
        },
        formationProgress
      });
    } else {
      return NextResponse.json(
        { message: "Type de statistiques requis" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
