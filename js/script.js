"use strict";


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
    const sidebarComponent =
        document.getElementById("sidebarComponent");

    if (!sidebarComponent) {
        return false;
    }

    const sidebarUrl =
        createSiteUrl("components/sidebar.html");

    try {
        const response = await fetch(sidebarUrl);

        if (!response.ok) {
            throw new Error(
                `사이드바 요청 실패: ${response.status}`
            );
        }

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

    const links =
        sidebar.querySelectorAll("[data-href]");

    links.forEach((link) => {
        const relativePath = link.dataset.href;

        if (!relativePath) {
            return;
        }

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

    if (!sidebar) {
        return;
    }

    document.body.classList.add("menu-open");

    sidebar.setAttribute(
        "aria-hidden",
        "false"
    );

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

    if (!sidebar) {
        return;
    }

    document.body.classList.remove("menu-open");

    sidebar.setAttribute(
        "aria-hidden",
        "true"
    );

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


document.addEventListener(
    "DOMContentLoaded",
    initializePage
);