module.exports = {
    description: "The official documentation for the Guzzler testing framework.",
    head: [
        ['link', {rel:"manifest", href:"/manifest.json"}],
        ['meta', {name: 'twitter:card', content: 'summary'}],
        ['meta', {name: 'twitter:site', content: '@AKWebDev'}],
        ['meta', {name: 'twitter:title', content: 'Supercharge your app or SDK'}],
        ['meta', {name: 'twitter:description', content: 'Supercharge your app or SDK with a testing framework for Guzzle'}],
        ['meta', {name: 'twitter:image', content: 'https://guzzler.dev/img/500x500-full.png'}],
        ['meta', {name: 'twitter:image:alt', content: 'The Guzzler logo'}]
    ],
    themeConfig: {
        logo: '/img/guzzler-logo.svg',
        nav: [
            { text: 'Home', link: '/'},
            { text: 'Why', link: '/why/'}
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
