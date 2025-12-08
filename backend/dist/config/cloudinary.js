import { v2 as cloudinaryV2 } from "cloudinary";
// Configuração do Cloudinary via variáveis de ambiente
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, } = process.env;
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinaryV2.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
}
else {
    // Aviso não bloqueante caso variáveis não estejam presentes
    console.warn("[cloudinary] Variáveis de ambiente não configuradas (CLOUD_NAME/API_KEY/API_SECRET). Uploads podem falhar.");
}
// Exporte tanto 'v2' quanto 'cloudinary' para compatibilidade com imports existentes
export const v2 = cloudinaryV2;
export const cloudinary = cloudinaryV2;
export default cloudinaryV2;
