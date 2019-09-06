module.exports = {
    description: "The official documentation for the Guzzler testing framework.",
    head: [
        ['link', {rel:"manifest", href:"/manifest.json"}],
        ['meta', {name: 'twitter:card', content: 'summary'}],
        ['meta', {name: 'twitter:creator', content: '@AKWebDev'}],
        ['meta', {name: 'twitter:title', content: 'Supercharge your app or SDK'}],
        ['meta', {name: 'twitter:description', content: 'Supercharge your app or SDK with a testing framework for Guzzle'}],
        ['meta', {name: 'og:image', content: 'https://guzzler.dev/img/Guzzler-logo.png'}],
        ['meta', {name: 'twitter:image', content: 'https://guzzler.dev/img/500x500-full.png'}],
        ['meta', {name: 'twitter:image:alt', content: 'The Guzzler logo'}],
        ['link', {rel: 'apple-touch-icon', sizes: '500x500', href:'https://guzzler.dev/img/500x500.png'}]
    ],
    themeConfig: {
        logo: '/img/guzzler-logo.svg',
        nav: [
            { text: 'Home', link: '/'},
            { text: 'Why', link: '/why/'},
            {
                text: 'Ecosystem',
                items: [
                    {text:'Hybrid', link:'https://hybrid.guzzler.dev'}
                ]
            }
        ],
        sidebar: [
            {
                title: 'Guide',
                collapsable: false,
                children: [
                    ['getting-started/', 'Getting Started'],
                    ['mocking-responses/', 'Mocking Responses'],
                    ['expectations/', 'Expectations'],
                    ['assertions/', 'Assertions'],
                    ['helpers/', 'Helpers'],
                    ['extending/', 'Extending Guzzler'],
                    ['troubleshooting/', 'Troubleshooting']
                ]
            },
            {
                title: 'Miscellaneous',
                collapsable: false,
                children: [
                    ['why/', 'Why'],
                    ['examples/', 'Examples'],
                    ['roadmap/', 'Road Map'],
                    ['changelog/', 'Changelog']
                ]
            }
        ],
        lastUpdated: 'Last Updated',
        repo: "blastcloud/guzzler",
        serviceWorker: {
            updatePopup: true
        }
    },
    ga: "UA-135533170-1",
    evergreen: true,
    serviceWorker: {
        updatePopup: true
    }
};
