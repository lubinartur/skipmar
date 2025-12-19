export type Language = 'EN' | 'ET' | 'FI';

export interface Translation {
  header: {
    services: string;
    supplies: string;
    about: string;
    contact: string;
  };
  hero: {
    h1: string;
    subline: string;
    bullets: string[];
    cta: string;
    phoneLabel: string;
  };
  services: {
    title: string;
    intro: string;
    workforce: { title: string; desc: string };
    supplies: { title: string; desc: string };
    welding: { title: string; desc: string };
  };
  about: {
    title: string;
    text: string;
  };
  contact: {
    title: string;
    subtitle: string;
    left: {
      hqLabel: string;
      directLabel: string;
      address: string;
      phone: string;
      email: string;
    };
    form: {
      header: string;
      name: string;
      email: string;
      phone: string;
      service: string;
      message: string;
      submit: string;
      submitting: string;
      success: string;
      sendAnother: string;
    };
    services: string[];
  };
}

export interface FormData {
  name: string;
  email: string;
  phone?: string;
  service: 'Workforce rental' | 'Supplies' | 'Welding coordination';
  partNumber?: string;
  message?: string;
  attachment?: FileList;
}