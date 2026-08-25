/**
 * Contact details copied from samarth-ramdas-website/src/data/contact.js
 * so the app and the site stay in agreement.
 */

export const contactPerson = {
  nameMr: 'सुहास क्षीरसागर',
  nameEn: 'Suhas Kshirsagar',
};

export const contactAddress = {
  titleMr: 'पत्ता',
  titleEn: 'Address',
  linesMr: [
    'रामदास स्वामी विचार फाउंडेशन',
    'P २०१ , बलवंतपुरम साम्राज्य सोसायटी,',
    'परमहंस नगर , कोथरूड',
    'पुणे ४११०३८',
  ],
  linesEn: [
    'Ramdas Swami Vichar Foundation',
    'P 201, Balwantpuram Samrajya Society,',
    'Paramhans Nagar, Kothrud',
    'Pune 411038',
  ],
};

export const contactPhones = [
  { tel: '+919881476020', display: '+91 9881476020' },
  { tel: '+918975656190', display: '+91 89756 56190' },
];

export const contactEmail = 'samarthvrati@gmail.com';

export const contactMapQuery = [contactPerson.nameEn, ...contactAddress.linesEn].join(', ');
