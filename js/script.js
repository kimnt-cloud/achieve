"use strict";

/*
    이 파일은 사이트의 공통 동작을 담당합니다.

    주요 역할
    1. 현재 페이지 기준의 루트 경로 계산
    2. 공통 sidebar.html 불러오기
    3. 사이드바 링크 주소 변환
    4. 현재 페이지 메뉴 강조
    5. 사이드바 열기와 닫기
    6. 반응형 화면 변화 처리
    7. 검색 버튼의 임시 동작 연결
*/


/*
    현재 HTML 파일의 body에 지정된 루트 경로를 반환합니다.

    예시:
    index.html
    <body data-root-path="">

    pages/youtube/index.html
    <body data-root-path="../../">

    pages/youtube/original-content/wanteez.html
    <body data-root-path="../../../">
*/
function getRootPath() {
    return document.body.dataset.rootPath || "";
}


/*
    사이트 루트를 기준으로 작성된 경로를
    현재 페이지에서 사용할 수 있는 실제 URL로 변환합니다.
*/
function createSiteUrl(relativePath) {
    /* 현재 페이지에서 사이트 루트까지 올라가는 상대 경로입니다. */
    const rootPath = getRootPath();

    return new URL(
        `${rootPath}${relativePath}`,
        document.baseURI
    ).href;
}


/*
    공통 사이드바 HTML을 불러옵니다.
*/
async function loadSidebar() {
    /* sidebar.html이 삽입될 빈 요소를 찾습니다. */
    const sidebarComponent =
        document.getElementById("sidebarComponent");

    if (!sidebarComponent) {
        return false;
    }

    const sidebarUrl =
        createSiteUrl("components/sidebar.html");

    try {
        /* 계산한 주소로 sidebar.html 파일을 요청합니다. */
        const response = await fetch(sidebarUrl);

        if (!response.ok) {
            throw new Error(
                `사이드바 요청 실패: ${response.status}`
            );
        }

        /* 응답받은 HTML 문자열을 실제 사이드바 영역에 삽입합니다. */
        const sidebarHtml = await response.text();

        sidebarComponent.innerHTML = sidebarHtml;

        return true;
    } catch (error) {
        console.error(
            "공통 사이드바를 불러오지 못했습니다.",
            error
        );

        sidebarComponent.innerHTML = `
            <p class="component-error-message">
                카테고리 메뉴를 불러오지 못했습니다.
            </p>
        `;

        return false;
    }
}


/*
    sidebar.html 안에 있는 data-href 값을
    실제 href 주소로 변환합니다.
*/
function convertSidebarLinks() {
    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) {
        return;
    }

    /* 실제 href 대신 data-href를 사용하는 모든 사이드바 링크를 찾습니다. */
    const links =
        sidebar.querySelectorAll("[data-href]");

    links.forEach((link) => {
        const relativePath = link.dataset.href;

        if (!relativePath) {
            return;
        }

        /* 현재 페이지 깊이에 맞는 실제 이동 주소를 href에 입력합니다. */
        link.href = createSiteUrl(relativePath);
    });
}


/*
    주소를 비교하기 쉽도록 정규화합니다.
*/
function normalizeUrl(url) {
    const normalizedUrl = new URL(url, document.baseURI);

    let pathname = decodeURIComponent(
        normalizedUrl.pathname
    );

    /* /index.html과 / 주소를 같은 페이지로 비교할 수 있게 통일합니다. */
    pathname = pathname.replace(/\/index\.html$/, "/");

    if (
        pathname.length > 1 &&
        pathname.endsWith("/")
    ) {
        pathname = pathname.slice(0, -1);
    }

    return {
        pathname,
        hash: normalizedUrl.hash
    };
}


/*
    현재 페이지에 해당하는 사이드바 링크를 강조하고,
    해당 링크가 들어 있는 대분류를 펼칩니다.
*/
function setCurrentSidebarLink() {
    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) {
        return;
    }

    const currentUrl = normalizeUrl(
        window.location.href
    );

    const sidebarLinks =
        sidebar.querySelectorAll("a[href]");

    let matchedLink = null;

    sidebarLinks.forEach((link) => {
        link.classList.remove("is-current");
        link.removeAttribute("aria-current");

        const linkUrl = normalizeUrl(link.href);

        const samePage =
            linkUrl.pathname === currentUrl.pathname;

        const sameHash =
            !linkUrl.hash ||
            linkUrl.hash === currentUrl.hash;

        if (samePage && sameHash && !matchedLink) {
            matchedLink = link;
        }
    });

    if (!matchedLink) {
        return;
    }

    matchedLink.classList.add("is-current");

    matchedLink.setAttribute(
        "aria-current",
        "page"
    );

    const parentDetails =
        matchedLink.closest("details");

    if (parentDetails) {
        parentDetails.open = true;
    }
}


/*
    사이드바를 엽니다.
*/
function openSidebar() {
    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("sidebar");

    const pageOverlay =
        document.getElementById("pageOverlay");

    if (!sidebar) {
        return;
    }

    document.body.classList.add("menu-open");

    /* CSS의 .sidebar.open 규칙이 적용되도록 클래스를 추가합니다. */
    sidebar.classList.add("open");
    sidebar.setAttribute(
        "aria-hidden",
        "false"
    );

    if (pageOverlay) {
        /* 사이드바 뒤쪽의 어두운 오버레이를 표시합니다. */
        pageOverlay.classList.add("show");
    }

    if (menuButton) {
        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );
    }
}


/*
    사이드바를 닫습니다.
*/
function closeSidebar() {
    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("sidebar");

    const pageOverlay =
        document.getElementById("pageOverlay");

    if (!sidebar) {
        return;
    }

    document.body.classList.remove("menu-open");

    /* 사이드바를 다시 화면 왼쪽 밖으로 숨깁니다. */
    sidebar.classList.remove("open");
    sidebar.setAttribute(
        "aria-hidden",
        "true"
    );

    if (pageOverlay) {
        /* 뒤쪽 오버레이를 숨기고 클릭을 막습니다. */
        pageOverlay.classList.remove("show");
    }

    if (menuButton) {
        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


/*
    메뉴 열기와 닫기 이벤트를 연결합니다.
*/
function initializeSidebarEvents() {
    const menuButton =
        document.getElementById("menuButton");

    const closeMenuButton =
        document.getElementById("closeMenuButton");

    const pageOverlay =
        document.getElementById("pageOverlay");

    if (menuButton) {
        menuButton.addEventListener(
            "click",
            openSidebar
        );
    }

    if (closeMenuButton) {
        closeMenuButton.addEventListener(
            "click",
            closeSidebar
        );
    }

    if (pageOverlay) {
        pageOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }

    /* Esc 키를 눌러도 열린 사이드바를 닫을 수 있게 합니다. */
    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Escape") {
                closeSidebar();
            }
        }
    );
}


/*
    모바일 환경에서 사이드바 링크를 누르면
    메뉴를 닫습니다.

    같은 페이지의 앵커 링크도 정상 이동합니다.
*/
function initializeSidebarLinkEvents() {
    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) {
        return;
    }

    const sidebarLinks =
        sidebar.querySelectorAll("a[href]");

    sidebarLinks.forEach((link) => {
        link.addEventListener(
            "click",
            () => {
                closeSidebar();
            }
        );
    });
}


/*
    화면 크기가 데스크톱으로 변경될 때
    열려 있던 모바일 사이드바 상태를 초기화합니다.
*/
function initializeResponsiveSidebar() {
    /* 화면이 1024px 이상인지 감지하는 미디어 쿼리입니다. */
    const desktopMediaQuery =
        window.matchMedia("(min-width: 1024px)");

    const handleScreenChange = (event) => {
        if (event.matches) {
            closeSidebar();
        }
    };

    desktopMediaQuery.addEventListener(
        "change",
        handleScreenChange
    );
}


/*
    검색 버튼의 임시 동작입니다.

    검색 기능 구현 단계에서
    검색 패널 또는 검색 페이지 연결 코드로 교체합니다.
*/
function initializeSearchButton() {
    const searchButton =
        document.getElementById("searchButton");

    if (!searchButton) {
        return;
    }

    searchButton.addEventListener(
        "click",
        () => {
            console.log(
                "검색 기능은 다음 단계에서 연결됩니다."
            );
        }
    );
}


/*
    페이지 초기 실행
*/
async function initializePage() {
    const sidebarLoaded =
        await loadSidebar();

    if (sidebarLoaded) {
        convertSidebarLinks();
        setCurrentSidebarLink();
        initializeSidebarEvents();
        initializeSidebarLinkEvents();
        initializeResponsiveSidebar();
    }

    initializeSearchButton();
}


/*
    HTML 구조가 모두 만들어진 뒤 initializePage를 실행합니다.
    sidebarComponent 같은 요소를 찾기 전에 코드가 실행되는 문제를 방지합니다.
*/
document.addEventListener(
    "DOMContentLoaded",
    initializePage
);