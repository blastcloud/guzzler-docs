module.exports = {
    description: "The official documentation for the Guzzler testing framework.",
    head: [
        ['link', {rel:"manifest", href:"/manifest.json"}]
    ],
    themeConfig: {
        logo: '/img/guzzler-logo.svg',
        nav: [
            { text: 'Home', link: '/'},
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
                    ['extending/', 'Extending Guzzler']
                ]
            },
            {
                title: 'Miscellaneous',
                collapsable: false,
                children: [
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
