// Default language (embedded). Other locales live in translations/{lang}.js
const translations = {
    en: {
        badgeTitle: "🤖 Let Me Gemini It",
        heading: "<span class='heading-plain'>Let me </span><span class='gemini-text'>Gemini</span><span class='heading-plain'> it for you</span>",
        subheading: "Your friend forgot how to use AI and keeps asking dumb questions? Create an interactive lesson for them!",
        inputPlaceholder: "What dumb question were you asked?",
        btnGetLink: "Get Link",
        btnTestSim: "Test Simulation",
        successMsg: "Link successfully generated!",
        copyBtn: "Copy",
        copiedBtn: "Copied!",
        warnTitle: "Developer's Note:",
        warnDesc1: 'This link is created inside a <span class="text-amber-300 font-semibold">temporary interactive preview (sandbox)</span>. It will work in this current tab (using "Test Simulation"), but your friends won\'t be able to access it from the external web as the session is protected.',
        warnDesc2: 'To make links shareable with everyone, host the whole project folder (index.html + translations/) for free on <a href="https://pages.github.com/" target="_blank" class="text-violet-400 hover:underline">GitHub Pages</a>, <a href="https://vercel.com" target="_blank" class="text-violet-400 hover:underline">Vercel</a>, or <a href="https://www.netlify.com" target="_blank" class="text-violet-400 hover:underline">Netlify</a>!',
        bottomDesc: "The sent URL will show your friend an interactive lesson, then redirect them to the answer with Gemini AI overview (`udm=50`).",
        simHeading: "<span class='heading-plain'>Let me </span><span class='gemini-text'>Gemini</span><span class='heading-plain'> it for you</span>",
        simPlaceholder: "Watch closely...",
        simBtnSearch: "Gemini Search",
        simBtnEasy: "Was that hard?",
        step1Title: "Step 1.",
        step1Desc: "Open the input line.",
        step2Title: "Step 2.",
        step2Desc: "Type your extremely complex question...",
        step3Title: "Step 3.",
        step3Desc: "Press 'Search' button.",
        bannerDefault: "Instructions for those too lazy...",
        redirectStatus: "Redirecting to Gemini...",
        redirectManual: "Go manually if stuck",
        fallbackWarning: "Please enter a question first!",
        sarcasms: [
            "Wow, let me teach you how to use AI...",
            "Watch my hands on the screen carefully.",
            "We type the text here, can you believe it?",
            "And now, a real technological miracle...",
            "Click the magical blue button!",
            "Voila! That was incredibly hard, wasn't it?"
        ]
    }
};

const langRegistry = {
    en: { label: 'English', flag: '🇺🇸' }
};
let extraLangCodes = [];
const langLoadPromises = {};

window.LMGIFY_REGISTER_TRANSLATION = (code, { label, flag, strings }) => {
    translations[code] = strings;
    langRegistry[code] = { label, flag };
};

const isLangAvailable = (lang) => lang === 'en' || extraLangCodes.includes(lang);

const fetchLangManifest = async () => {
    try {
        const res = await fetch('translations/manifest.json');
        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];

        const locales = data.map((entry) => {
            if (typeof entry === 'string') {
                return { code: entry, label: entry.toUpperCase(), flag: '' };
            }
            return {
                code: entry.code,
                label: entry.label || entry.code,
                flag: entry.flag || '',
            };
        }).filter((entry) => typeof entry.code === 'string');

        for (const { code, label, flag } of locales) {
            langRegistry[code] = { label, flag };
        }

        return locales.map((entry) => entry.code);
    } catch (err) {
        console.warn('Could not load translations/manifest.json', err);
        return [];
    }
};

const ensureLanguage = (lang) => {
    if (lang === 'en' || translations[lang]) {
        return Promise.resolve(lang === 'en' || translations[lang] ? lang : 'en');
    }
    if (!extraLangCodes.includes(lang)) {
        return Promise.resolve('en');
    }
    if (langLoadPromises[lang]) {
        return langLoadPromises[lang];
    }

    langLoadPromises[lang] = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `translations/${lang}.js`;
        script.onload = () => {
            if (translations[lang]) {
                resolve(lang);
            } else {
                console.warn(`Translation "${lang}" did not register, falling back to English.`);
                resolve('en');
            }
        };
        script.onerror = () => {
            console.warn(`Failed to load translations/${lang}.js, falling back to English.`);
            resolve('en');
        };
        document.head.appendChild(script);
    });

    return langLoadPromises[lang];
};

let currentLanguage = 'en';

const initIcons = () => {
    document.querySelectorAll('[data-lmgify-icon]').forEach((el) => {
        const name = el.getAttribute('data-lmgify-icon');
        const size = el.getAttribute('data-lmgify-size') || 'w-4 h-4';
        window.LMGIFY_SET_ICON(el, name, `inline-flex shrink-0 ${size}`);
    });
};

const applyReducedMotion = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduce-motion');
    }
};

const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
};

document.addEventListener('DOMContentLoaded', async () => {
    applyReducedMotion();
    initIcons();

    const creatorSection = document.getElementById('creator-section');
    const userQueryInput = document.getElementById('user-query');
    const clearBtn = document.getElementById('clear-btn');
    const btnGenerate = document.getElementById('btn-generate');
    const btnPreviewDirect = document.getElementById('btn-preview-direct');
    const resultPanel = document.getElementById('result-panel');
    const generatedUrl = document.getElementById('generated-url');
    const btnCopy = document.getElementById('btn-copy');
    const copyText = document.getElementById('copy-text');
    const copyIcon = document.getElementById('copy-icon');

    const playbackSection = document.getElementById('playback-section');
    const playbackQuery = document.getElementById('playback-query');
    const virtualSearchWrapper = document.getElementById('virtual-search-wrapper');
    const virtualBtnSearch = document.getElementById('virtual-btn-search');
    const virtualCursor = document.getElementById('virtual-cursor');

    const bannerInstruction = document.getElementById('banner-instruction');
    const bannerText = document.getElementById('banner-text');
    const bubbleStep1 = document.getElementById('bubble-step1');
    const bubbleStep2 = document.getElementById('bubble-step2');
    const bubbleStep3 = document.getElementById('bubble-step3');
    const redirectNotification = document.getElementById('redirect-notification');
    const directSearchLink = document.getElementById('direct-search-link');

    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const langLabel = document.getElementById('current-lang-label');

    const applyLanguage = (lang) => {
        if (!translations[lang]) lang = 'en';
        currentLanguage = lang;
        langLabel.innerText = langRegistry[lang]?.label || lang;

        document.getElementById('badge-title').innerText = translations[lang].badgeTitle;
        document.getElementById('main-heading').innerHTML = translations[lang].heading;
        document.getElementById('main-subheading').innerText = translations[lang].subheading;
        userQueryInput.placeholder = translations[lang].inputPlaceholder;
        document.getElementById('txt-get-link').innerText = translations[lang].btnGetLink;
        document.getElementById('txt-test-sim').innerText = translations[lang].btnTestSim;
        document.getElementById('txt-success-msg').innerText = translations[lang].successMsg;
        copyText.innerText = translations[lang].copyBtn;
        document.getElementById('warn-title').innerText = translations[lang].warnTitle;
        document.getElementById('warn-desc-1').innerHTML = translations[lang].warnDesc1;
        document.getElementById('warn-desc-2').innerHTML = translations[lang].warnDesc2;
        document.getElementById('result-description').innerText = translations[lang].bottomDesc;

        document.getElementById('playback-heading').innerHTML = translations[lang].simHeading;
        playbackQuery.placeholder = translations[lang].simPlaceholder;
        document.getElementById('txt-sim-search').innerText = translations[lang].simBtnSearch;
        document.getElementById('txt-sim-easy').innerText = translations[lang].simBtnEasy;

        document.getElementById('step1-title').innerText = translations[lang].step1Title;
        document.getElementById('step1-desc').innerText = translations[lang].step1Desc;
        document.getElementById('step2-title').innerText = translations[lang].step2Title;
        document.getElementById('step2-desc').innerText = translations[lang].step2Desc;
        document.getElementById('step3-title').innerText = translations[lang].step3Title;
        document.getElementById('step3-desc').innerText = translations[lang].step3Desc;

        bannerText.innerText = translations[lang].bannerDefault;
        document.getElementById('txt-redirect-status').innerText = translations[lang].redirectStatus;
        document.getElementById('txt-redirect-manual').innerText = translations[lang].redirectManual;
    };

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
    });

    const buildLangDropdown = () => {
        langDropdown.innerHTML = '';
        const langBtnClass = 'w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center justify-between';

        const addLangButton = (code) => {
            const meta = langRegistry[code];
            if (!meta) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-lang', code);
            btn.className = langBtnClass;
            btn.innerHTML = `${meta.label} <span>${meta.flag || ''}</span>`;
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const selectedLang = btn.getAttribute('data-lang');
                const resolvedLang = await ensureLanguage(selectedLang);
                applyLanguage(resolvedLang);
                localStorage.setItem('lmgify_lang', resolvedLang);
                langDropdown.classList.add('hidden');
            });
            langDropdown.appendChild(btn);
        };

        addLangButton('en');
        extraLangCodes.forEach(addLangButton);
    };

    const getQueryParams = () => {
        const params = {};
        const search = window.location.search;
        if (search) {
            const parts = search.substring(1).split('&');
            for (const part of parts) {
                const [key, value] = part.split('=');
                if (key) params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
            }
        }
        const hash = window.location.hash;
        if (!params.q && hash.includes('q=')) {
            const match = hash.match(/q=([^&]*)/);
            if (match) params.q = decodeURIComponent(match[1].replace(/\+/g, ' '));
        }
        if (!params.lang && hash.includes('lang=')) {
            const match = hash.match(/lang=([^&]*)/);
            if (match) params.lang = decodeURIComponent(match[1]);
        }
        return params;
    };

    const queryParams = getQueryParams();

    extraLangCodes = await fetchLangManifest();
    buildLangDropdown();

    let initialLang = 'en';
    if (queryParams.lang && isLangAvailable(queryParams.lang)) {
        initialLang = queryParams.lang;
    } else {
        const cachedLang = localStorage.getItem('lmgify_lang');
        if (cachedLang && isLangAvailable(cachedLang)) {
            initialLang = cachedLang;
        } else {
            const browserLang = navigator.language.slice(0, 2);
            if (isLangAvailable(browserLang)) {
                initialLang = browserLang;
            }
        }
    }
    initialLang = await ensureLanguage(initialLang);
    applyLanguage(initialLang);

    userQueryInput.addEventListener('input', () => {
        if (userQueryInput.value.trim().length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    });

    clearBtn.addEventListener('click', () => {
        userQueryInput.value = '';
        clearBtn.classList.add('hidden');
        resultPanel.classList.add('hidden');
        userQueryInput.focus();
    });

    const generateLink = () => {
        const rawQuery = userQueryInput.value.trim();
        if (!rawQuery) {
            userQueryInput.parentElement.classList.add('animate-bounce');
            setTimeout(() => {
                userQueryInput.parentElement.classList.remove('animate-bounce');
            }, 1000);
            userQueryInput.placeholder = translations[currentLanguage].fallbackWarning;
            return null;
        }

        const baseHref = window.location.href.split('?')[0].split('#')[0];
        const finalUrl = `${baseHref}?q=${encodeURIComponent(rawQuery)}&lang=${currentLanguage}`;

        generatedUrl.innerText = finalUrl;
        resultPanel.classList.remove('hidden');
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return finalUrl;
    };

    btnGenerate.addEventListener('click', generateLink);

    btnPreviewDirect.addEventListener('click', () => {
        const rawQuery = userQueryInput.value.trim();
        if (!rawQuery) {
            userQueryInput.placeholder = translations[currentLanguage].fallbackWarning;
            userQueryInput.parentElement.classList.add('animate-bounce');
            setTimeout(() => userQueryInput.parentElement.classList.remove('animate-bounce'), 1000);
            return;
        }
        setupSimulation(rawQuery);
    });

    btnCopy.addEventListener('click', async () => {
        const linkText = generatedUrl.innerText;
        try {
            await copyToClipboard(linkText);
            btnCopy.classList.add('bg-emerald-800', 'text-white');
            copyText.innerText = translations[currentLanguage].copiedBtn;
            window.LMGIFY_SET_ICON(copyIcon, 'check', 'inline-flex shrink-0 w-4 h-4');

            setTimeout(() => {
                btnCopy.classList.remove('bg-emerald-800', 'text-white');
                copyText.innerText = translations[currentLanguage].copyBtn;
                window.LMGIFY_SET_ICON(copyIcon, 'copy', 'inline-flex shrink-0 w-4 h-4');
            }, 2000);
        } catch (err) {
            console.error('Unable to copy link', err);
        }
    });

    const triggerClickRipple = (x, y) => {
        const pulse = document.createElement('div');
        pulse.className = 'click-pulse';
        pulse.style.left = `${x}px`;
        pulse.style.top = `${y}px`;
        document.body.appendChild(pulse);
        setTimeout(() => {
            pulse.remove();
        }, 1000);
    };

    const animateCursorTo = (targetX, targetY, duration, callback) => {
        const cursor = virtualCursor;
        cursor.classList.add('is-animating');
        const startX = parseFloat(cursor.style.left) || window.innerWidth + 100;
        const startY = parseFloat(cursor.style.top) || window.innerHeight + 100;
        const startTime = performance.now();

        const ctrlX = startX + (targetX - startX) * 0.3 + (Math.random() - 0.5) * 200;
        const ctrlY = startY + (targetY - startY) * 0.3 + (Math.random() - 0.5) * 200;

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const ease = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;

            const currentX = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * ctrlX + ease * ease * targetX;
            const currentY = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * ctrlY + ease * ease * targetY;

            cursor.style.left = `${currentX}px`;
            cursor.style.top = `${currentY}px`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                cursor.classList.remove('is-animating');
                if (callback) callback();
            }
        };
        requestAnimationFrame(step);
    };

    const typeText = (text, element, charInterval, callback) => {
        let index = 0;
        element.value = "";

        const timer = setInterval(() => {
            if (index < text.length) {
                element.value += text.charAt(index);
                index++;
                element.scrollLeft = element.scrollWidth;
            } else {
                clearInterval(timer);
                if (callback) callback();
            }
        }, charInterval);
    };

    const startSimulationSequence = (queryText) => {
        document.getElementById('lang-picker-container').style.display = 'none';

        virtualCursor.style.left = `${window.innerWidth - 80}px`;
        virtualCursor.style.top = `${window.innerHeight / 2}px`;

        const isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            virtualCursor.style.display = 'block';
        }

        const s = translations[currentLanguage].sarcasms;

        setTimeout(() => {
            bannerText.innerText = s[0];
            bannerInstruction.classList.remove('scale-90', 'opacity-0');
            bannerInstruction.classList.add('scale-100', 'opacity-100');
        }, 500);

        setTimeout(() => {
            bubbleStep1.classList.add('show');

            const rect = virtualSearchWrapper.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2 + window.scrollY;

            if (!isMobile) {
                animateCursorTo(targetX, targetY, 1500, () => {
                    triggerClickRipple(targetX, targetY);
                    virtualSearchWrapper.classList.add('scale-[1.01]', 'border-violet-500');
                    bannerText.innerText = s[1];
                    setTimeout(startTyping, 600);
                });
            } else {
                virtualSearchWrapper.classList.add('scale-[1.01]', 'border-violet-500');
                setTimeout(startTyping, 800);
            }
        }, 1800);

        const startTyping = () => {
            bubbleStep2.classList.add('show');
            bannerText.innerText = s[2];

            typeText(queryText, playbackQuery, 120, () => {
                virtualSearchWrapper.classList.remove('scale-[1.01]');
                bannerText.innerText = s[3];
                setTimeout(moveToSearchButton, 800);
            });
        };

        const moveToSearchButton = () => {
            bubbleStep3.classList.add('show');

            const rect = virtualBtnSearch.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2 + window.scrollY;

            if (!isMobile) {
                animateCursorTo(targetX, targetY, 1200, () => {
                    bannerText.innerText = s[4];

                    setTimeout(() => {
                        triggerClickRipple(targetX, targetY);
                        virtualBtnSearch.classList.add('scale-95', 'brightness-125');
                        setTimeout(finalizeRedirect, 500);
                    }, 400);
                });
            } else {
                virtualBtnSearch.classList.add('scale-95', 'brightness-125');
                setTimeout(finalizeRedirect, 800);
            }
        };

        const finalizeRedirect = () => {
            virtualBtnSearch.classList.remove('scale-95', 'brightness-125');
            bannerText.innerText = s[5];

            redirectNotification.classList.remove('hidden');
            const targetSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(queryText)}&udm=50`;
            directSearchLink.href = targetSearchUrl;

            setTimeout(() => {
                window.location.href = targetSearchUrl;
            }, 1800);
        };
    };

    const setupSimulation = (query) => {
        creatorSection.classList.add('opacity-0');
        setTimeout(() => {
            creatorSection.classList.add('hidden');
            playbackSection.classList.remove('hidden');
            setTimeout(() => {
                playbackSection.classList.add('opacity-100');
                startSimulationSequence(query);
            }, 100);
        }, 400);
    };

    if (queryParams.q) {
        setupSimulation(queryParams.q);
    }
});
