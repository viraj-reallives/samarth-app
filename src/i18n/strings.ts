/**
 * Every user-visible string in the app.
 *
 * Marathi is the reference language: write it first, then English. If a key is
 * missing from `en` at runtime, the Marathi string shows instead of a blank.
 *
 * Note the distinction that matters here:
 *   - `lang` is the INTERFACE language (what the buttons say)
 *   - the `language` facet is the language a WORK is written in
 * A reader may well want an English interface over a Marathi corpus. Changing
 * one must never change the other.
 */

export const LANGUAGES = ['mr', 'en'] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANG_NAME: Record<Lang, string> = {
  mr: 'मराठी',
  en: 'English',
};

const mr = {
  'tab.browse': 'ग्रंथसंग्रह',
  'tab.downloads': 'डाउनलोड',
  'tab.saved': 'माझी यादी',
  'tab.about': 'परिचय',

  'browse.subtitle': 'श्री रामदासांचे साहित्य',
  'browse.count': '{count} साहित्यकृती',
  'browse.search': 'साहित्य शोधा…',
  'browse.empty': 'या शोधाशी जुळणारे काही सापडले नाही.',
  'browse.error': 'ग्रंथसंग्रह उघडता आला नाही.',
  'browse.retry': 'पुन्हा प्रयत्न करा',
  'browse.clearSearch': 'शोध पुसा',

  'home.choose': 'जे माहित आहे ते निवडा',
  'home.popular': 'लोकप्रिय',
  'home.path.subject': 'विषयानुसार',
  'home.path.author': 'लेखकानुसार',
  'home.path.language': 'भाषेनुसार',

  'facet.search': 'यादीत शोधा',
  'facet.empty': 'या यादीत काही सापडले नाही.',
  'works.narrow': 'या संग्रहात शोधा',
  'works.kindAll': 'सर्व',

  'filter.title': 'शोध मर्यादित करा',
  'filter.open': 'शोध मर्यादित करा',
  'filter.kind': 'प्रकार',
  'filter.subject': 'विषय',
  'filter.author': 'लेखक',
  'filter.language': 'भाषा',
  'filter.clear': 'सर्व काढा',
  'filter.apply': 'पाहा',
  'filter.close': 'बंद करा',

  'kind.pdf': 'ग्रंथ',
  'kind.audio': 'श्रवण',

  'work.read': 'वाचा',
  'work.listen': 'ऐका',
  'work.pause': 'थांबवा',
  'work.unavailable': 'ही फाईल सध्या उपलब्ध नाही.',
  'work.error': 'ही साहित्यकृती उघडता आली नाही.',
  'work.size': 'आकार',
  'work.back': 'मागे',
  'work.share': 'पाठवा',
  'work.save': 'यादीत ठेवा',
  'work.unsave': 'यादीतून काढा',
  'work.audioError': 'ध्वनिफीत सुरू होऊ शकली नाही.',
  'work.loading': 'लोड होत आहे…',
  'work.skipBack': '१५ सेकंद मागे',
  'work.skipForward': '१५ सेकंद पुढे',
  'work.rate': 'गती बदला',

  'common.cancel': 'रद्द करा',

  'download.action': 'डाउनलोड करा',
  'download.inProgress': 'डाउनलोड होत आहे…',
  'download.onDevice': 'फोनवर आहे',
  'download.offline': 'ऑफलाइन',
  'download.retry': 'पुन्हा डाउनलोड करा',
  'download.remove': 'काढून टाका',
  'download.removeTitle': 'फोनवरून काढायचे?',
  'download.removeBody': 'फाईल फोनवरून काढली जाईल. पुन्हा डाउनलोड करता येईल.',
  'download.summary': '{count} फाईली · {size}',
  'download.clear': 'सर्व काढा',
  'download.clearTitle': 'सर्व डाउनलोड काढायचे?',
  'download.clearBody': 'फोनवरील सर्व फाईली काढल्या जातील.',
  'download.empty': 'फोनवर काही नाही.',
  'download.emptyHint': 'डाउनलोड केलेले साहित्य नेटशिवाय वाचता व ऐकता येते.',
  'download.emptyKind': 'या प्रकारात काही डाउनलोड केलेले नाही.',

  'player.resumed': '{time} पासून पुढे · सुरुवातीपासून ऐका',

  'saved.count': '{count} नोंदी',
  'saved.empty': 'अद्याप काही जतन केलेले नाही.',
  'saved.emptyHint': 'कोणतीही साहित्यकृती उघडा आणि खूण करा, ती इथे दिसेल.',

  'about.invocation': '॥ जय जय रघुवीर समर्थ ॥',
  'about.body':
    'समर्थ व्यासपीठ – रामदास स्वामी विचार फाऊंडेशन यांच्या संग्रहातील ग्रंथ, नियतकालिके आणि प्रवचनांची ध्वनिफिती या ॲपमधून वाचता व ऐकता येतील.',
  'about.tab.general': 'सामान्य माहिती',
  'about.tab.contact': 'संपर्क',
  'about.sitePromo':
    'समर्थ रामदासांचे अधिक साहित्य, बातम्या आणि माहितीसाठी आमचे संकेतस्थळ अवश्य भेट द्या.',
  'about.openSite': 'संकेतस्थळ पहा',
  'about.privacy': 'गोपनीयता धोरण',
  'about.language': 'ॲपची भाषा',
  'about.languageHint': 'यामुळे साहित्याची भाषा बदलत नाही, फक्त ॲपमधील मजकूर बदलतो.',
  'about.version': 'आवृत्ती {version}',

  'contact.intro': 'खालील पत्त्यावर संपर्क साधा किंवा फॉर्मद्वारे लिहा.',
  'contact.detailsHeading': 'संपर्क माहिती',
  'contact.personRole': 'संपर्क व्यक्ति',
  'contact.phoneHeading': 'संपर्क क्रमांक',
  'contact.emailLabel': 'ईमेल',
  'contact.openMap': 'नकाशा उघडा',
  'contact.formEmailNote': 'तुम्ही थेट येथे देखील लिहू शकता',
  'contact.participation': 'सहभाग',
  'contact.feedback': 'अभिप्राय',
  'contact.participationHint': 'सहभागासाठी तुमची माहिती भरा.',
  'contact.feedbackHint': 'तुमचा अभिप्राय किंवा सूचना पाठवा.',
  'contact.yourName': 'तुमचे नाव',
  'contact.namePlaceholder': 'नाव लिहा',
  'contact.yourEmail': 'तुमचा ईमेल',
  'contact.message': 'संदेश',
  'contact.messagePlaceholder': 'संदेश लिहा…',
  'contact.yourPhone': 'तुमचा फोन',
  'contact.nameRequired': 'कृपया नाव लिहा.',
  'contact.emailInvalid': 'कृपया योग्य ईमेल लिहा.',
  'contact.messageRequired': 'कृपया संदेश लिहा.',
  'contact.sendError': 'संदेश पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.',
  'contact.networkError': 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.',
  'contact.success': 'धन्यवाद! तुमची माहिती पाठवली गेली.',
  'contact.submit': 'पाठवा',
  'contact.sending': 'पाठवत आहे…',
  'contact.captcha': 'सुरक्षा तपासणी',
  'contact.captchaAnswer': 'उत्तर',
  'contact.captchaRefresh': 'नवीन प्रश्न',
  'contact.captchaEnter': 'कृपया उत्तर लिहा.',
  'contact.captchaWrong': 'चुकीचे उत्तर. पुन्हा प्रयत्न करा.',
};

const en: Partial<Record<keyof typeof mr, string>> = {
  'tab.browse': 'Library',
  'tab.downloads': 'Downloads',
  'tab.saved': 'Saved',
  'tab.about': 'About',

  'browse.subtitle': 'The writings of Shri Ramdas',
  'browse.count': '{count} works',
  'browse.search': 'Search literature…',
  'browse.empty': 'Nothing matches this search.',
  'browse.error': 'The library could not be opened.',
  'browse.retry': 'Try again',
  'browse.clearSearch': 'Clear search',

  'home.choose': 'Start with what you know',
  'home.popular': 'Popular',
  'home.path.subject': 'By subject',
  'home.path.author': 'By author',
  'home.path.language': 'By language',

  'facet.search': 'Search this list',
  'facet.empty': 'Nothing in this list matches.',
  'works.narrow': 'Search in this collection',
  'works.kindAll': 'All',

  'filter.title': 'Narrow the search',
  'filter.open': 'Filter',
  'filter.kind': 'Type',
  'filter.subject': 'Subject',
  'filter.author': 'Author',
  'filter.language': 'Language',
  'filter.clear': 'Clear all',
  'filter.apply': 'Show results',
  'filter.close': 'Close',

  'kind.pdf': 'Text',
  'kind.audio': 'Audio',

  'work.read': 'Read',
  'work.listen': 'Play',
  'work.pause': 'Pause',
  'work.unavailable': 'This file is not available right now.',
  'work.error': 'This work could not be opened.',
  'work.size': 'Size',
  'work.back': 'Back',
  'work.share': 'Share',
  'work.save': 'Save',
  'work.unsave': 'Remove from saved',
  'work.audioError': 'The recording could not be played.',
  'work.loading': 'Loading…',
  'work.skipBack': 'Back 15 seconds',
  'work.skipForward': 'Forward 15 seconds',
  'work.rate': 'Change speed',

  'common.cancel': 'Cancel',

  'download.action': 'Download',
  'download.inProgress': 'Downloading…',
  'download.onDevice': 'On this device',
  'download.offline': 'Offline',
  'download.retry': 'Download again',
  'download.remove': 'Remove',
  'download.removeTitle': 'Remove from device?',
  'download.removeBody': 'The file will be deleted. You can download it again later.',
  'download.summary': '{count} files · {size}',
  'download.clear': 'Remove all',
  'download.clearTitle': 'Remove all downloads?',
  'download.clearBody': 'Every downloaded file will be deleted from this device.',
  'download.empty': 'Nothing downloaded yet.',
  'download.emptyHint': 'Downloaded works can be read and heard with no connection.',
  'download.emptyKind': 'Nothing of this type is downloaded.',

  'player.resumed': 'Resumed from {time} · play from the start',

  'saved.count': '{count} saved',
  'saved.empty': 'Nothing saved yet.',
  'saved.emptyHint': 'Open any work and tap the bookmark to keep it here.',

  'about.invocation': '॥ जय जय रघुवीर समर्थ ॥',
  'about.body':
    'Books, periodicals and recorded discourses from the collection of Samarth Vyaspeeth, the Ramdas Swami Vichar Foundation.',
  'about.tab.general': 'General information',
  'about.tab.contact': 'Contact us',
  'about.sitePromo':
    'Visit our website for more of Samarth Ramdas’s literature, news and information.',
  'about.openSite': 'Visit the website',
  'about.privacy': 'Privacy policy',
  'about.language': 'App language',
  'about.languageHint': 'This changes the app text only, not the language of the works.',
  'about.version': 'Version {version}',

  'contact.intro': 'Reach us at the address below or write to us using the form.',
  'contact.detailsHeading': 'Contact details',
  'contact.personRole': 'Contact person',
  'contact.phoneHeading': 'Contact number',
  'contact.emailLabel': 'Email',
  'contact.openMap': 'Open in maps',
  'contact.formEmailNote': 'You can also write directly to',
  'contact.participation': 'Participation',
  'contact.feedback': 'Feedback',
  'contact.participationHint': 'Fill in your details to participate.',
  'contact.feedbackHint': 'Send your feedback or suggestions.',
  'contact.yourName': 'Your name',
  'contact.namePlaceholder': 'Enter your name',
  'contact.yourEmail': 'Your email',
  'contact.message': 'Message',
  'contact.messagePlaceholder': 'Write your message…',
  'contact.yourPhone': 'Your phone',
  'contact.nameRequired': 'Please enter your name.',
  'contact.emailInvalid': 'Please enter a valid email.',
  'contact.messageRequired': 'Please write a message.',
  'contact.sendError': 'Could not send your message. Please try again.',
  'contact.networkError': 'Network error. Please try again.',
  'contact.success': 'Thank you! Your details have been sent.',
  'contact.submit': 'Submit',
  'contact.sending': 'Sending…',
  'contact.captcha': 'Security check',
  'contact.captchaAnswer': 'Answer',
  'contact.captchaRefresh': 'New question',
  'contact.captchaEnter': 'Please enter the answer.',
  'contact.captchaWrong': 'Wrong answer. Please try again.',
};

export type StringKey = keyof typeof mr;

export const STRINGS: Record<Lang, Partial<Record<StringKey, string>>> = { mr, en };
