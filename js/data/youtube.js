"use strict";


/*
    YouTube 대분류 페이지 데이터

    저장 위치:
    js/data/youtube.js

    members에는 아래 짧은 코드만 입력합니다.

    a  : 단체
    hj : 홍중
    sh : 성화
    yh : 윤호
    ys : 여상
    mg : 민기
    s  : 산
    wy : 우영
    jh : 종호

    단체 콘텐츠 예시:
    members: ["a"]

    유닛 콘텐츠 예시:
    members: ["hj", "sh"]
*/

window.categoryPageData = {
    pageTitle: "YouTube",

    filters: [
        {
            id: "original",
            label: "Original Content"
        },
        {
            id: "external",
            label: "External Content"
        }
    ],

    detailCategories: [
        {
            id: "wanteez",
            parent: "original",
            label: "WANTEEZ"
        },
        {
            id: "logbook",
            parent: "original",
            label: "Logbook"
        },
        {
            id: "atoz",
            parent: "original",
            label: "A to Z"
        },
        {
            id: "feverroad",
            parent: "original",
            label: "Fever Road"
        },
        {
            id: "specialclip",
            parent: "original",
            label: "Special Clip"
        }, 
        {
            id: "interview",
            parent: "external",
            label: "Interview"
        },
        {
            id: "1n2d",
            parent: "external",
            label: "1N2D"
        },
        {
            id: "9teez",
            parent: "external",
            label: "9트쫑"
        },
        {
            id: "ateez+",
            parent: "external",
            label: "ATEEZ+"
        }, 
        {
            id: "dingo",
            parent: "external",
            label: "Dingo"
        },
        {
            id: "youtubeetc",
            parent: "external",
            label: "YouTube Etc."
        },
        {
            id: "idolhuman",
            parent: "external",
            label: "아이돌 인간극장"
        },
    ],

    contents: [
        /*
        {
            title: "WANTEEZ EP.1",
            subcategory: "original",
            detailCategory: "wanteez",
            uploadDate: "2022-08-15",
            type: "youtube",
            link: "https://www.youtube.com/watch?v=VIDEO_ID",
            members: ["a"],
            tags: [
                "예능",
                "게임",
                "자체콘텐츠"
            ]
        },
        */

        /*
        {
            title: "홍중 성화 인터뷰",
            subcategory: "external",
            detailCategory: "interview",
            uploadDate: "2026-07-30",
            type: "youtube",
            link: "https://youtu.be/VIDEO_ID",
            members: ["hj", "sh"],
            tags: [
                "인터뷰"
            ]
        }
        */
    ]
};
