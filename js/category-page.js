"use strict";


/*
    대분류 페이지 공통 엔진

    필요한 스크립트 순서:

    1. member-data.js
    2. 페이지별 데이터 파일
    3. category-page.js
*/


function getCategoryPageData() {
    const pageData = window.categoryPageData;

    if (!pageData || typeof pageData !== "object") {
        console.error(
            "대분류 페이지 데이터를 찾을 수 없습니다. " +
            "페이지별 데이터 파일을 category-page.js보다 먼저 불러오세요."
        );

        return {
            pageTitle: "",
            filters: [],
            detailCategories: [],
            contents: []
        };
    }

    return {
        pageTitle:
            typeof pageData.pageTitle === "string"
                ? pageData.pageTitle
                : "",

        filters: Array.isArray(pageData.filters)
            ? pageData.filters
            : [],

        detailCategories:
            Array.isArray(pageData.detailCategories)
                ? pageData.detailCategories
                : [],

        contents: Array.isArray(pageData.contents)
            ? pageData.contents
            : []
    };
}


function getCategoryFilterLabel(filters, filterId) {
    if (filterId === "all") {
        return "All";
    }

    const matchedFilter = filters.find((filter) => {
        return filter.id === filterId;
    });

    return matchedFilter?.label || filterId || "";
}


function getDetailCategoryLabel(detailCategories, detailId) {
    const matchedDetail = detailCategories.find((detail) => {
        return detail.id === detailId;
    });

    return matchedDetail?.label || detailId || "";
}


function getUploadDateValue(content) {
    if (
        !content ||
        typeof content.uploadDate !== "string"
    ) {
        return 0;
    }

    const dateValue = Date.parse(content.uploadDate);

    return Number.isNaN(dateValue)
        ? 0
        : dateValue;
}


function sortContentsByUploadDate(contents) {
    return [...contents].sort((firstContent, secondContent) => {
        return (
            getUploadDateValue(secondContent) -
            getUploadDateValue(firstContent)
        );
    });
}


function createFilterButton(
    className,
    dataName,
    filter,
    isActive = false
) {
    const button = document.createElement("button");

    button.className = className;
    button.type = "button";
    button.dataset[dataName] = filter.id;
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", String(isActive));

    if (isActive) {
        button.classList.add("is-active");
    }

    return button;
}


function renderCategoryFilterButtons(filters) {
    const filterContainer =
        document.getElementById("categoryFilter");

    if (!filterContainer) {
        return;
    }

    const fragment = document.createDocumentFragment();

    fragment.appendChild(
        createFilterButton(
            "category-filter-button",
            "filter",
            {
                id: "all",
                label: "All"
            },
            true
        )
    );

    filters.forEach((filter) => {
        if (
            !filter ||
            typeof filter.id !== "string" ||
            typeof filter.label !== "string" ||
            filter.id === "all"
        ) {
            return;
        }

        fragment.appendChild(
            createFilterButton(
                "category-filter-button",
                "filter",
                filter
            )
        );
    });

    filterContainer.replaceChildren(fragment);
}


function renderDetailFilterButtons(
    detailCategories,
    selectedCategory
) {
    const detailContainer =
        document.getElementById("detailCategoryFilter");

    if (!detailContainer) {
        return;
    }

    const availableDetails = detailCategories.filter((detail) => {
        return (
            selectedCategory === "all" ||
            detail.parent === selectedCategory
        );
    });

    if (availableDetails.length === 0) {
        detailContainer.hidden = true;
        detailContainer.replaceChildren();
        return;
    }

    const fragment = document.createDocumentFragment();

    fragment.appendChild(
        createFilterButton(
            "detail-filter-button",
            "detailFilter",
            {
                id: "all",
                label: "전체"
            },
            true
        )
    );

    availableDetails.forEach((detail) => {
        fragment.appendChild(
            createFilterButton(
                "detail-filter-button",
                "detailFilter",
                detail
            )
        );
    });

    detailContainer.replaceChildren(fragment);
    detailContainer.hidden = false;
}


function extractYouTubeVideoId(link) {
    if (typeof link !== "string" || link.trim() === "") {
        return "";
    }

    const trimmedLink = link.trim();

    try {
        const url = new URL(trimmedLink);
        const hostname = url.hostname
            .replace(/^www\./, "")
            .replace(/^m\./, "");

        if (hostname === "youtu.be") {
            return url.pathname.split("/").filter(Boolean)[0] || "";
        }

        if (
            hostname === "youtube.com" ||
            hostname === "music.youtube.com"
        ) {
            const queryVideoId = url.searchParams.get("v");

            if (queryVideoId) {
                return queryVideoId;
            }

            const pathParts = url.pathname
                .split("/")
                .filter(Boolean);

            const supportedPathTypes = [
                "shorts",
                "live",
                "embed"
            ];

            if (
                pathParts.length >= 2 &&
                supportedPathTypes.includes(pathParts[0])
            ) {
                return pathParts[1];
            }
        }
    } catch (error) {
        console.warn(
            "올바른 YouTube 주소가 아닙니다:",
            trimmedLink
        );
    }

    return "";
}


function getYouTubeThumbnailUrl(
    videoId,
    quality = "maxresdefault"
) {
    return (
        "https://i.ytimg.com/vi/" +
        `${encodeURIComponent(videoId)}/${quality}.jpg`
    );
}


function getContentLink(content) {
    if (
        typeof content.link === "string" &&
        content.link.trim() !== ""
    ) {
        return content.link.trim();
    }

    return "#";
}


function createCategoryThumbnail(content) {
    const youtubeVideoId =
        content.type === "youtube"
            ? extractYouTubeVideoId(content.link)
            : "";

    const isYouTubeContent = youtubeVideoId !== "";

    const imageSource = isYouTubeContent
        ? getYouTubeThumbnailUrl(
            youtubeVideoId,
            "maxresdefault"
        )
        : content.image;

    if (imageSource) {
        const image = document.createElement("img");

        image.className = "content-card-image";
        image.src = imageSource;
        image.alt = content.imageAlt || content.title || "";
        image.loading = "lazy";
        image.decoding = "async";

        if (isYouTubeContent) {
            image.addEventListener(
                "error",
                () => {
                    image.src = getYouTubeThumbnailUrl(
                        youtubeVideoId,
                        "hqdefault"
                    );
                },
                {
                    once: true
                }
            );
        }

        return image;
    }

    const placeholder = document.createElement("div");
    const placeholderText = document.createElement("span");

    placeholder.className = "content-card-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholderText.textContent = content.placeholder || "ATEEZ";

    placeholder.appendChild(placeholderText);

    return placeholder;
}


function getValidatedMembers(content) {
    if (
        typeof window.validateAteezMemberCodes !== "function"
    ) {
        return Array.isArray(content.members)
            ? content.members
            : [];
    }

    return window.validateAteezMemberCodes(content.members);
}


function createCategoryCard(
    content,
    filters,
    detailCategories
) {
    const card = document.createElement("a");
    const cardBody = document.createElement("div");
    const categoryText = document.createElement("p");
    const title = document.createElement("h3");
    const memberText = document.createElement("p");

    const memberCodes = getValidatedMembers(content);

    card.className = "content-card category-content-card";
    card.href = getContentLink(content);
    card.dataset.category = content.subcategory || "";
    card.dataset.detailCategory = content.detailCategory || "";
    card.dataset.members = memberCodes.join(" ");
    card.dataset.searchText = createContentSearchText(
        content,
        filters,
        detailCategories,
        memberCodes
    );

    if (content.uploadDate) {
        card.dataset.uploadDate = content.uploadDate;
    }

    if (content.type === "youtube") {
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute(
            "aria-label",
            `${content.title || "YouTube 영상"} 새 창에서 보기`
        );
    }

    cardBody.className = "content-card-body";
    categoryText.className = "content-card-category";

    const categoryLabel = getCategoryFilterLabel(
        filters,
        content.subcategory
    );

    const detailLabel = getDetailCategoryLabel(
        detailCategories,
        content.detailCategory
    );

    categoryText.textContent = detailLabel
        ? `${categoryLabel} · ${detailLabel}`
        : categoryLabel;

    title.className = "content-card-title";
    title.textContent = content.title || "제목 없음";

    memberText.className = "content-card-members";
    memberText.textContent =
        typeof window.getAteezMemberText === "function"
            ? window.getAteezMemberText(memberCodes)
            : memberCodes.join(" / ");

    cardBody.appendChild(categoryText);
    cardBody.appendChild(title);

    if (memberText.textContent) {
        cardBody.appendChild(memberText);
    }

    card.appendChild(createCategoryThumbnail(content));
    card.appendChild(cardBody);

    return card;
}


function createContentSearchText(
    content,
    filters,
    detailCategories,
    memberCodes
) {
    const textParts = [
        content.title,
        content.uploadDate,
        getCategoryFilterLabel(filters, content.subcategory),
        getDetailCategoryLabel(
            detailCategories,
            content.detailCategory
        ),
        ...(Array.isArray(content.tags) ? content.tags : [])
    ];

    memberCodes.forEach((memberCode) => {
        const member = window.ATEEZ_MEMBER_DATA?.[memberCode];

        if (!member) {
            return;
        }

        textParts.push(member.label, ...member.aliases);

        if (memberCode === "a") {
            Object.values(window.ATEEZ_MEMBER_DATA || {})
                .forEach((allMember) => {
                    textParts.push(
                        allMember.label,
                        ...allMember.aliases
                    );
                });
        }
    });

    const normalize =
        window.normalizeArchiveSearchText ||
        ((value) => String(value ?? "").toLowerCase());

    return normalize(textParts.filter(Boolean).join(" "));
}


function renderCategoryCards(
    contents,
    filters,
    detailCategories
) {
    const contentGrid =
        document.getElementById("categoryContentGrid");

    if (!contentGrid) {
        return;
    }

    const fragment = document.createDocumentFragment();
    const sortedContents = sortContentsByUploadDate(contents);

    sortedContents.forEach((content) => {
        if (!content || typeof content !== "object") {
            return;
        }

        fragment.appendChild(
            createCategoryCard(
                content,
                filters,
                detailCategories
            )
        );
    });

    contentGrid.replaceChildren(fragment);
}


function getCurrentFilterState() {
    return {
        category:
            document.querySelector(
                ".category-filter-button.is-active"
            )?.dataset.filter || "all",

        detail:
            document.querySelector(
                ".detail-filter-button.is-active"
            )?.dataset.detailFilter || "all",

        search:
            document.getElementById("categorySearchInput")
                ?.value || ""
    };
}


function updateVisibleCards(filters) {
    const state = getCurrentFilterState();
    const cards = document.querySelectorAll(
        ".category-content-card"
    );

    const normalize =
        window.normalizeArchiveSearchText ||
        ((value) => String(value ?? "").toLowerCase());

    const normalizedSearch = normalize(state.search);
    let visibleCount = 0;

    cards.forEach((card) => {
        const matchesCategory =
            state.category === "all" ||
            card.dataset.category === state.category;

        const matchesDetail =
            state.detail === "all" ||
            card.dataset.detailCategory === state.detail;

        const matchesSearch =
            normalizedSearch === "" ||
            card.dataset.searchText.includes(normalizedSearch);

        const shouldShow =
            matchesCategory &&
            matchesDetail &&
            matchesSearch;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCount += 1;
        }
    });

    const emptyMessage =
        document.getElementById("categoryEmptyMessage");

    if (emptyMessage) {
        emptyMessage.hidden = visibleCount !== 0;
    }

    const resultCount = document.querySelector(
        "[data-filter-result-count]"
    );

    if (resultCount) {
        const filterLabel = getCategoryFilterLabel(
            filters,
            state.category
        );

        resultCount.textContent =
            state.category === "all"
                ? `전체 ${visibleCount}개`
                : `${filterLabel} ${visibleCount}개`;
    }
}


function setActiveButton(buttons, selectedButton) {
    buttons.forEach((button) => {
        const isActive = button === selectedButton;

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}


function initializeCategoryControls(
    filters,
    detailCategories
) {
    const categoryContainer =
        document.getElementById("categoryFilter");

    const detailContainer =
        document.getElementById("detailCategoryFilter");

    const searchInput =
        document.getElementById("categorySearchInput");

    categoryContainer?.addEventListener("click", (event) => {
        const clickedButton = event.target.closest(
            ".category-filter-button[data-filter]"
        );

        if (!clickedButton) {
            return;
        }

        setActiveButton(
            categoryContainer.querySelectorAll(
                ".category-filter-button"
            ),
            clickedButton
        );

        renderDetailFilterButtons(
            detailCategories,
            clickedButton.dataset.filter
        );

        updateVisibleCards(filters);
    });

    detailContainer?.addEventListener("click", (event) => {
        const clickedButton = event.target.closest(
            ".detail-filter-button[data-detail-filter]"
        );

        if (!clickedButton) {
            return;
        }

        setActiveButton(
            detailContainer.querySelectorAll(
                ".detail-filter-button"
            ),
            clickedButton
        );

        updateVisibleCards(filters);
    });

    searchInput?.addEventListener("input", () => {
        updateVisibleCards(filters);
    });
}


function initializeCategoryPage() {
    const pageData = getCategoryPageData();

    renderCategoryFilterButtons(pageData.filters);

    renderDetailFilterButtons(
        pageData.detailCategories,
        "all"
    );

    renderCategoryCards(
        pageData.contents,
        pageData.filters,
        pageData.detailCategories
    );

    initializeCategoryControls(
        pageData.filters,
        pageData.detailCategories
    );

    updateVisibleCards(pageData.filters);
}


document.addEventListener(
    "DOMContentLoaded",
    initializeCategoryPage
);
