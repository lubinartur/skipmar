
import { FormData } from '../types';

/**
 * In a real Next.js environment, this would call a server-side API route (/api/kommo)
 * that uses KOMMO_ACCESS_TOKEN and KOMMO_SUBDOMAIN securely.
 */
export async function sendToKommo(data: FormData): Promise<boolean> {
  console.log('Sending data to Kommo CRM integration...', data);
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // This is where you'd perform a fetch to your own backend API
    // const response = await fetch('/api/leads', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
    // return response.ok;
    
    // For this demo, we simulate success
    return true;
  } catch (error) {
    console.error('Error sending lead to Kommo:', error);
    return false;
  }
}

/**
 * Loads the Kommo Chat Widget
 */
export function initKommoWidget() {
  // This is a typical script implementation for Kommo/amoCRM widget
  // Replace with actual ID from Kommo integration panel
  if (typeof window !== 'undefined') {
    (function(a: any, m: Document, o: string, c: string, r: string) {
        a[o] = a[o] || function() {
            (a[o].q = a[o].q || []).push(arguments)
        };
        // Explicitly cast to HTMLScriptElement to resolve property access errors
        const t = m.createElement(c) as HTMLScriptElement,
            e = m.getElementsByTagName(c)[0];
        t.async = true;
        t.id = r;
        t.src = "https://gso.kommo.com/js/button.js";
        if (e && e.parentNode) {
            e.parentNode.insertBefore(t, e);
        }
    })(window, document, 'amoSocialButton', 'script', 'amo_social_button');
    
    // Config would come from user's dashboard
    // window.amoSocialButton('init', { id: 'YOUR_ID', ... });
  }
}
