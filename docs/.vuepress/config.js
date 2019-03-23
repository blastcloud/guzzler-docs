module.exports = {
    themeConfig: {
        logo: '/img/guzzler-logo.svg',
        updatePopup: true,
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
                    ['helpers/', 'Helpers']
                ]
            },
            {
                title: 'Miscellaneous',
                collapsable: true,
                children: [
                    ['changelog/', 'Changelog']
                ]
            }
        ],
        lastUpdated: 'Last Updated',
        repo: "blastcloud/guzzler"
    },
    ga: "UA-135533170-1",
    evergreen: true,
    markdown: {
       /* config: md => {
            const vuepressTabs = require('vuepress-tabs');
            vuepressTabs(md)
        }*/
    }
};
