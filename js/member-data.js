"use strict";


/*
    ATEEZ 멤버 공통 데이터

    데이터 파일에는 짧은 코드만 입력합니다.

    a  : 단체
    hj : 홍중
    sh : 성화
    yh : 윤호
    ys : 여상
    mg : 민기
    s  : 산
    wy : 우영
    jh : 종호

    화면 표시와 검색 별칭 처리는 이 파일에서 담당합니다.
*/

window.ATEEZ_MEMBER_DATA = {
    a: {
        label: "단체",
        aliases: [
            "a",
            "all",
            "단체",
            "전체",
            "완전체",
            "에이티즈",
            "ateez"
        ]
    },

    hj: {
        label: "홍중",
        aliases: [
            "hj",
            "홍중",
            "김홍중",
            "hongjoong",
            "kimhongjoong",
            "hoongjoong"
        ]
    },

    sh: {
        label: "성화",
        aliases: [
            "sh",
            "성화",
            "박성화",
            "seonghwa",
            "parkseonghwa"
        ]
    },

    yh: {
        label: "윤호",
        aliases: [
            "yh",
            "윤호",
            "정윤호",
            "yunho",
            "jeongyunho",
            "jungyunho"
        ]
    },

    ys: {
        label: "여상",
        aliases: [
            "ys",
            "여상",
            "강여상",
            "yeosang",
            "kangyeosang"
        ]
    },

    mg: {
        label: "민기",
        aliases: [
            "mg",
            "민기",
            "송민기",
            "mingi",
            "songmingi"
        ]
    },

    s: {
        label: "산",
        aliases: [
            "s",
            "산",
            "최산",
            "san",
            "choisan"
        ]
    },

    wy: {
        label: "우영",
        aliases: [
            "wy",
            "우영",
            "정우영",
            "wooyoung",
            "jungwooyoung",
            "jeongwooyoung"
        ]
    },

    jh: {
        label: "종호",
        aliases: [
            "jh",
            "종호",
            "최종호",
            "jongho",
            "choijongho"
        ]
    }
};


/*
    검색 비교용 문자열로 정리합니다.

    대소문자, 공백, 하이픈, 밑줄 차이를 무시합니다.
*/
window.normalizeArchiveSearchText = function (value) {
    return String(value ?? "")
        .normalize("NFKC")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
};


/*
    검색어와 일치하는 멤버 코드를 반환합니다.

    예:
    홍중 / Hongjoong / hj → hj
*/
window.findAteezMemberCode = function (searchWord) {
    const normalizedWord =
        window.normalizeArchiveSearchText(searchWord);

    if (!normalizedWord) {
        return null;
    }

    for (
        const [memberCode, member] of
        Object.entries(window.ATEEZ_MEMBER_DATA)
    ) {
        const isMatched = member.aliases.some((alias) => {
            return (
                window.normalizeArchiveSearchText(alias) ===
                normalizedWord
            );
        });

        if (isMatched) {
            return memberCode;
        }
    }

    return null;
};


/*
    멤버 코드를 화면 표시용 한글 이름으로 변환합니다.
*/
window.getAteezMemberLabel = function (memberCode) {
    return (
        window.ATEEZ_MEMBER_DATA[memberCode]?.label ||
        memberCode ||
        ""
    );
};


/*
    멤버 코드 배열을 한글 이름 배열로 변환합니다.
*/
window.getAteezMemberLabels = function (memberCodes) {
    if (!Array.isArray(memberCodes)) {
        return [];
    }

    return memberCodes
        .map((memberCode) => {
            return window.getAteezMemberLabel(memberCode);
        })
        .filter(Boolean);
};


/*
    멤버 코드 배열을 화면 표시용 문자열로 변환합니다.

    예:
    ["hj", "sh", "s"] → "홍중 / 성화 / 산"
*/
window.getAteezMemberText = function (memberCodes) {
    return window
        .getAteezMemberLabels(memberCodes)
        .join(" / ");
};


/*
    콘텐츠의 멤버 코드 입력을 검사합니다.
*/
window.validateAteezMemberCodes = function (memberCodes) {
    if (!Array.isArray(memberCodes)) {
        return [];
    }

    const validCodes = memberCodes.filter((memberCode) => {
        const isValid = Boolean(
            window.ATEEZ_MEMBER_DATA[memberCode]
        );

        if (!isValid) {
            console.warn(
                `알 수 없는 멤버 코드입니다: ${memberCode}`
            );
        }

        return isValid;
    });

    if (
        validCodes.includes("a") &&
        validCodes.length > 1
    ) {
        console.warn(
            '멤버 코드 "a"는 개별 멤버 코드와 함께 입력하지 마세요.'
        );

        return ["a"];
    }

    return [...new Set(validCodes)];
};
