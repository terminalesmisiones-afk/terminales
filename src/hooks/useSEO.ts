
import { useEffect } from 'react';

interface SEOData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const useSEO = (data: SEOData) => {
  useEffect(() => {
    // Actualizar el título de la página
    document.title = data.title;

    // Función helper para actualizar o crear meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (isName) {
          metaTag.name = property;
        } else {
          metaTag.setAttribute('property', property);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.content = content;
    };

    // Meta tags básicas
    updateMetaTag('description', data.description, true);
    
    // Open Graph tags
    updateMetaTag('og:title', data.title);
    updateMetaTag('og:description', data.description);
    updateMetaTag('og:image', data.image);
    updateMetaTag('og:url', data.url);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'Terminales Misiones');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', data.title, true);
    updateMetaTag('twitter:description', data.description, true);
    updateMetaTag('twitter:image', data.image, true);

    // Cleanup function para cuando el componente se desmonte
    return () => {
      // Opcional: limpiar las meta tags si es necesario
    };
  }, [data.title, data.description, data.image, data.url]);
};
