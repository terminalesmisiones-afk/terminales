
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ['iframe', 'img'], // Allow iframes for embeds if needed, verify security policy
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'style', 'class', 'target'],
    });
};
