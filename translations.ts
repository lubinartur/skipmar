import { Language, Translation } from './types';

export const translations: Record<Language, Translation> = {
  EN: {
    header: { services: 'Services', supplies: 'Supplies', about: 'About', contact: 'Contact' },
    hero: {
      h1: 'Ship supplies & workforce coordination in Baltic ports',
      subline: 'Fast response, reliable delivery, long-term cooperation',
      bullets: ['Workforce rental', 'Ship & technical supplies', 'Welding coordination'],
      cta: 'Request a quote',
      phoneLabel: 'Available 24/7'
    },
    services: {
      title: 'Our Solutions',
      intro: 'Critical technical infrastructure and logistics for the Baltic maritime ecosystem. We ensure your fleet stays operational.',
      workforce: { title: 'Workforce Rental', desc: 'Skilled personnel for maritime and industrial projects across the Baltic region.' },
      supplies: { title: 'Ship & Technical Supplies', desc: 'Comprehensive technical support and spare parts delivery for vessels.' },
      welding: { title: 'Welding Coordination', desc: 'Expert management and coordination for complex welding operations.' }
    },
    about: {
      title: 'About SkipMar',
      text: 'SkipMar OÜ is a specialized maritime service provider based in Estonia. We bridge the gap between ship owners and technical requirements, providing high-quality workforce and supplies across major Baltic ports. Our focus is reliability, speed, and technical excellence.'
    },
    contact: {
      title: 'LET\'S CONNECT',
      subtitle: 'Send us a request and we\'ll get back to you shortly.',
      left: {
        hqLabel: 'HEADQUARTERS',
        directLabel: 'DIRECT CONTACT',
        address: 'Vana-Tartu Maantee 79a,\nPeetri, 75312 Harju County',
        phone: '+372 5555 2590',
        email: 'info@skipmar.ee'
      },
      form: {
        header: 'REQUEST / QUOTE',
        name: 'Name / Company',
        email: 'Email',
        phone: 'Phone',
        service: 'Service',
        message: 'Message',
        submit: 'REQUEST A QUOTE',
        submitting: 'SENDING…',
        success: 'SENT',
        sendAnother: 'SEND ANOTHER MESSAGE'
      },
      services: [
        'Workforce rental',
        'Ship supplies',
        'Welding coordination'
      ]
    }
  },
  ET: {
    header: { services: 'Teenused', supplies: 'Tarned', about: 'Meist', contact: 'Kontakt' },
    hero: {
      h1: 'Laevade varustamine ja tööjõu koordineerimine Balti sadamates',
      subline: 'Kiire reageerimine, usaldusväärne tarne, pikaajaline koostöö',
      bullets: ['Tööjõu rent', 'Laevade ja tehnilised tarned', 'Keevitustööde koordineerimine'],
      cta: 'Küsi pakkumist',
      phoneLabel: 'Kättesaadav 24/7'
    },
    services: {
      title: 'Meie lahendused',
      intro: 'Oluline tehniline infrastruktuur ja logistika Balti meremajanduse jaoks. Tagame teie laevastiku töökindluse.',
      workforce: { title: 'Tööjõu rent', desc: 'Kvalifitseeritud personal mere- ja tööstusprojektideks kogu Balti regioonis.' },
      supplies: { title: 'Laevade ja tehnilised tarned', desc: 'Põhjalik tehniline tugi ja varuosade tarnimine laevadele.' },
      welding: { title: 'Keevitustööde koordineerimine', desc: 'Eksperttasemel juhtimine ja koordineerimine keerukate keevitusoperatsioonide jaoks.' }
    },
    about: {
      title: 'SkipMar-ist',
      text: 'SkipMar OÜ on Eestis asuv spetsialiseerunud mereteenuste pakkuja. Me ühendame laevaomanikud ja tehnilised nõuded, pakkudes kvaliteetset tööjõudu ja tarneid suuremates Balti sadamates.'
    },
    contact: {
      title: 'VÕTA ÜHENDUST',
      subtitle: 'Saada meile päring ja võtame sinuga peagi ühendust.',
      left: {
        hqLabel: 'PEAKONTOR',
        directLabel: 'OTSEKONTAKT',
        address: 'Vana-Tartu Maantee 79a,\nPeetri, 75312 Harju maakond',
        phone: '+372 5555 2590',
        email: 'info@skipmar.ee'
      },
      form: {
        header: 'PÄRING / PAKKUMINE',
        name: 'Nimi / Ettevõte',
        email: 'E-post',
        phone: 'Telefon',
        service: 'Teenus',
        message: 'Sõnum',
        submit: 'KÜSI PAKKUMIST',
        submitting: 'SAADAN…',
        success: 'SAADETUD',
        sendAnother: 'SAADA UUS SÕNUM'
      },
      services: [
        'Tööjõu rent',
        'Laevade varustamine',
        'Keevitustööde koordineerimine'
      ]
    }
  },
  FI: {
    header: { services: 'Palvelut', supplies: 'Tarvikkeet', about: 'Tietoa', contact: 'Ota yhteyttä' },
    hero: {
      h1: 'Laivatarvikkeet ja työvoiman koordinointi Itämeren satamissa',
      subline: 'Nopea vaste, luotettava toimitus, pitkäaikainen yhteistyö',
      bullets: ['Työvoiman vuokraus', 'Laiva- ja tekniset tarvikkeet', 'Hitsauksen koordinointi'],
      cta: 'Pyydä tarjous',
      phoneLabel: 'Saatavilla 24/7'
    },
    services: {
      title: 'Palvelumme',
      intro: 'Kriittinen tekninen infrastruktuuri ja logistiikka Itämeren meriekosysteemille. Varmistamme alustenne toimivuuden.',
      workforce: { title: 'Työvoiman vuokraus', desc: 'Ammattitaitoinen henkilöstö merenkulun ja teollisuuden projekteihin Itämeren alueella.' },
      supplies: { title: 'Laiva- ja tekniset tarvikkeet', desc: 'Kattava tekninen tuki ja varaosien toimitus aluksille.' },
      welding: { title: 'Hitsauksen koordinointi', desc: 'Asiantunteva johtaminen ja koordinointi monimutkaisiin hitsaustöihin.' }
    },
    about: {
      title: 'Tietoa SkipMarista',
      text: 'SkipMar OÜ on virolainen merenkulun palveluntarjoaja. Yhdistämme alusten omistajat ja tekniset vaatimukset tarjoamalla korkealaatuista työvoimaa ja tarvikkeita.'
    },
    contact: {
      title: 'OTA YHTEYTTÄ',
      subtitle: 'Lähetä meille tarjouspyyntö, niin palaamme asiaan pian.',
      left: {
        hqLabel: 'PÄÄTOIMISTO',
        directLabel: 'SUORA YHTEYS',
        address: 'Vana-Tartu Maantee 79a,\nPeetri, 75312 Harju maakunta',
        phone: '+372 5555 2590',
        email: 'info@skipmar.ee'
      },
      form: {
        header: 'PYYNTÖ / TARJOUS',
        name: 'Nimi / Yritys',
        email: 'Sähköposti',
        phone: 'Puhelin',
        service: 'Palvelu',
        message: 'Viesti',
        submit: 'PYYDÄ TARJOUS',
        submitting: 'LÄHETETÄÄN…',
        success: 'LÄHETETTY',
        sendAnother: 'LÄHETÄ UUSI VIESTI'
      },
      services: [
        'Työvoiman vuokraus',
        'Laivatarvikkeet',
        'Hitsauksen koordinointi'
      ]
    }
  }
};