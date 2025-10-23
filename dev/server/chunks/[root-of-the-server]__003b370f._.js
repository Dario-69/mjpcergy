module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
}),
"[externals]/mongoose [external] (mongoose, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}),
"[project]/src/lib/video-storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VideoStorageService",
    ()=>VideoStorageService,
    "videoStorageService",
    ()=>videoStorageService
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
;
class VideoStorageService {
    static instance;
    db = null;
    bucket = null;
    constructor(){}
    static getInstance() {
        if (!VideoStorageService.instance) {
            VideoStorageService.instance = new VideoStorageService();
        }
        return VideoStorageService.instance;
    }
    async connectDB() {
        if (this.db && __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connection.readyState === 1) {
            return;
        }
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        try {
            // Utiliser la connexion mongoose existante ou en créer une nouvelle
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connection.readyState !== 1) {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(process.env.MONGODB_URI, {
                    bufferCommands: false,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    tls: true,
                    tlsAllowInvalidCertificates: true,
                    tlsAllowInvalidHostnames: true
                });
            }
            this.db = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connection.db;
            this.bucket = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["GridFSBucket"](this.db, {
                bucketName: 'videos'
            });
            console.log('✅ Connexion MongoDB réussie pour GridFS via Mongoose');
        } catch (error) {
            console.error('❌ Erreur de connexion MongoDB:', error);
            throw error;
        }
    }
    /**
   * Upload une vidéo vers GridFS
   */ async uploadVideo(file, filename, metadata) {
        try {
            console.log('🎬 Service GridFS - Début upload:', {
                filename,
                bufferSize: file.length,
                metadata
            });
            await this.connectDB();
            if (!this.bucket) {
                throw new Error('GridFSBucket not initialized');
            }
            // Générer un nom de fichier unique
            const fileId = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"]();
            const fileExtension = filename.split('.').pop();
            const gridFSFilename = `${fileId.toString()}.${fileExtension}`;
            console.log('📤 Création du stream d\'upload:', {
                fileId: fileId.toString(),
                gridFSFilename,
                originalFilename: filename
            });
            // Upload vers GridFS
            const uploadStream = this.bucket.openUploadStream(gridFSFilename, {
                metadata: {
                    ...metadata,
                    originalFilename: filename,
                    uploadedAt: new Date()
                }
            });
            return new Promise((resolve, reject)=>{
                uploadStream.end(file);
                uploadStream.on('finish', ()=>{
                    console.log('✅ Upload GridFS terminé:', fileId.toString());
                    resolve(fileId.toString());
                });
                uploadStream.on('error', (error)=>{
                    console.error('❌ Erreur upload GridFS:', error);
                    reject(error);
                });
            });
        } catch (error) {
            console.error('Erreur lors de l\'upload vers GridFS:', error);
            throw error;
        }
    }
    /**
   * Récupère une vidéo depuis GridFS
   */ async getVideo(videoId) {
        try {
            await this.connectDB();
            if (!this.bucket || !this.db) {
                throw new Error('Database not initialized');
            }
            const objectId = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](videoId);
            // Vérifier que le fichier existe
            const files = await this.db.collection('videos.files').find({
                _id: objectId
            }).toArray();
            if (files.length === 0) {
                throw new Error('Vidéo non trouvée');
            }
            const downloadStream = this.bucket.openDownloadStream(objectId);
            const metadata = files[0];
            return {
                stream: downloadStream,
                metadata
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la vidéo:', error);
            throw error;
        }
    }
    /**
   * Supprime une vidéo de GridFS
   */ async deleteVideo(videoId) {
        try {
            const bucket = await this.getBucket();
            const objectId = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](videoId);
            await bucket.delete(objectId);
        } catch (error) {
            console.error('Erreur lors de la suppression de la vidéo:', error);
            throw error;
        }
    }
    /**
   * Récupère les métadonnées d'une vidéo
   */ async getVideoMetadata(videoId) {
        try {
            const bucket = await this.getBucket();
            const objectId = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](videoId);
            const files = await bucket.find({
                _id: objectId
            }).toArray();
            if (files.length === 0) {
                throw new Error('Vidéo non trouvée');
            }
            return files[0];
        } catch (error) {
            console.error('Erreur lors de la récupération des métadonnées:', error);
            throw error;
        }
    }
    /**
   * Liste toutes les vidéos d'un utilisateur
   */ async getUserVideos(userId) {
        try {
            const bucket = await this.getBucket();
            const files = await bucket.find({
                'metadata.uploadedBy': userId
            }).toArray();
            return files;
        } catch (error) {
            console.error('Erreur lors de la récupération des vidéos utilisateur:', error);
            throw error;
        }
    }
    /**
   * Vérifie si un fichier vidéo existe
   */ async videoExists(videoId) {
        try {
            const bucket = await this.getBucket();
            const objectId = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](videoId);
            const files = await bucket.find({
                _id: objectId
            }).toArray();
            return files.length > 0;
        } catch (error) {
            return false;
        }
    }
}
const videoStorageService = VideoStorageService.getInstance();
}),
"[project]/src/app/api/videos/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$video$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/video-storage.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        console.log('🎬 API Upload vidéo - Début');
        const formData = await request.formData();
        const file = formData.get('file');
        const title = formData.get('title');
        const description = formData.get('description');
        const uploadedBy = formData.get('uploadedBy');
        const department = formData.get('department');
        console.log('📋 Données reçues:', {
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
            title,
            description,
            uploadedBy,
            department
        });
        if (!file || !title || !uploadedBy) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Fichier, titre et utilisateur requis"
            }, {
                status: 400
            });
        }
        // Vérifier le type de fichier
        if (!file.type.startsWith('video/')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Le fichier doit être une vidéo"
            }, {
                status: 400
            });
        }
        // Vérifier la taille (limite de 100MB pour GridFS)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Le fichier est trop volumineux. Taille maximale : 100MB"
            }, {
                status: 400
            });
        }
        // Convertir le fichier en buffer
        console.log('🔄 Conversion du fichier en buffer...');
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log('✅ Buffer créé, taille:', buffer.length);
        // Upload vers GridFS
        console.log('📤 Upload vers GridFS...');
        const videoId = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$video$2d$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["videoStorageService"].uploadVideo(buffer, file.name, {
            title,
            description: description || '',
            uploadedBy,
            department: department || undefined
        });
        console.log('✅ Upload réussi, videoId:', videoId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            videoId,
            filename: file.name,
            size: file.size,
            type: file.type
        });
    } catch (error) {
        console.error("❌ Erreur lors de l'upload:", error);
        console.error("🔍 Détails de l'erreur:", {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Erreur lors de l'upload de la vidéo"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__003b370f._.js.map