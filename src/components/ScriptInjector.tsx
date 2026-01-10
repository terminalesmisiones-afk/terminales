
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const ScriptInjector: React.FC = () => {
    const { data: seoSettings } = useQuery({
        queryKey: ['seo-public'],
        queryFn: async () => {
            const res = await fetch('/api/seo');
            if (!res.ok) throw new Error('Failed to fetch SEO settings');
            return res.json();
        }
    });

    useEffect(() => {
        if (!seoSettings) return;

        // Function to inject scripts
        const inject = (html: string, location: 'head' | 'body') => {
            if (!html) return;

            // Create a temp container to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const scripts = tempDiv.getElementsByTagName('script');
            const noscripts = tempDiv.getElementsByTagName('noscript');
            const others = Array.from(tempDiv.children).filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'NOSCRIPT');

            // Handle Scripts (Execute them)
            Array.from(scripts).forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.innerHTML = oldScript.innerHTML; // Inline Content
                if (location === 'head') document.head.appendChild(newScript);
                else document.body.appendChild(newScript);
            });

            // Handle NoScripts & Others
            [...Array.from(noscripts), ...others].forEach(el => {
                if (location === 'head') document.head.appendChild(el.cloneNode(true));
                else document.body.appendChild(el.cloneNode(true));
            });
        };

        // WARNING: This naive implementation might duplicate scripts on re-renders if not cleaned up.
        // Ideally we should mark them with an ID and remove on unmount.
        // For MVP Production, we just verify they exist.
        // A better approach is to use a library like 'react-helmet' or 'next/head' but this is Vite.

        // Simple dedupe check?
        if (seoSettings.headScripts && !document.getElementById('inserted-head-scripts')) {
            const marker = document.createElement('meta');
            marker.id = 'inserted-head-scripts';
            document.head.appendChild(marker);
            inject(seoSettings.headScripts, 'head');
        }

        if (seoSettings.bodyScripts && !document.getElementById('inserted-body-scripts')) {
            const marker = document.createElement('div');
            marker.id = 'inserted-body-scripts';
            marker.style.display = 'none';
            document.body.appendChild(marker);
            inject(seoSettings.bodyScripts, 'body');
        }

    }, [seoSettings]);

    return null; // Component renders nothing
};

export default ScriptInjector;
