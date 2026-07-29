"use strict";


/*
    대분류 허브 페이지 공통 기능

    이 파일은 실제 콘텐츠 데이터를 직접 저장하지 않습니다.
    각 대분류의 데이터 파일에서 아래 전역 객체를 먼저 준비해야 합니다.

    예시:
    window.categoryPageData = {
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

        contents: [
            {
                title: "Wanteez",
                subcategory: "original",
                image: "",
                placeholder: "W",
                link: "original-content/wanteez/wanteez.html"
            }
        ]
    };

    All 버튼은 이 파일에서 자동으로 생성합니다.
    모든 콘텐츠는 별도의 all 값을 저장하지 않아도
    All 필터에 자동으로 포함됩니다.
*/


/*
    현재 페이지의 대분류 데이터를 반환합니다.
*/
function getCategoryPageData() {
    const pageData = window.categoryPageData;

    if (!pageData || typeof pageData !== "object") {
        console.error(
            "대분류 페이지 데이터를 찾을 수 없습니다. " +
            "페이지별 데이터 파일을 category-page.js보다 먼저 불러오세요."
        );

        return {
            filters: [],
            contents: []
        };
    }

    return {
        filters: Array.isArray(pageData.filters)
            ? pageData.filters
            : [],

        contents: Array.isArray(pageData.contents)
            ? pageData.contents
            : []
    };
}


/*
    필터 ID에 해당하는 표시 이름을 반환합니다.
*/
function getCategoryFilterLabel(filters, filterId) {
    if (filterId === "all") {
        return "All";
    }

    const matchedFilter = filters.find(
        (filter) => filter.id === filterId
    );

    return matchedFilter
        ? matchedFilter.label
        : filterId;
}


/*
    중분류 필터 버튼 하나를 생성합니다.
*/
function createCategoryFilterButton(filter, isActive = false) {
    const button = document.createElement("button");

    button.className = "category-filter-button";
    button.type = "button";
    button.dataset.filter = filter.id;
    button.textContent = filter.label;
    button.setAttribute(
        "aria-pressed",
        String(isActive)
    );

    if (isActive) {
        button.classList.add("is-active");
    }

    return button;
}


/*
    All 버튼과 데이터 파일에 등록된 중분류 버튼을 생성합니다.
*/
function renderCategoryFilterButtons(filters) {
    const filterContainer =
        document.getElementById("categoryFilter");

    if (!filterContainer) {
        return;
    }

    const fragment = document.createDocumentFragment();

    fragment.appendChild(
        createCategoryFilterButton(
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
            createCategoryFilterButton(filter)
        );
    });

    filterContainer.replaceChildren(fragment);
}


/*
    이미지 또는 임시 썸네일 요소를 생성합니다.
*/
function createCategoryThumbnail(content) {
    if (content.image) {
        const image = document.createElement("img");

        image.className = "content-card-image";
        image.src = content.image;
        image.alt = content.imageAlt || "";
        image.loading = "lazy";

        return image;
    }

    const placeholder = document.createElement("div");
    const placeholderText = document.createElement("span");

    placeholder.className = "content-card-placeholder";
    placeholder.setAttribute("aria-hidden", "true");

    placeholderText.textContent =
        content.placeholder || "ATEEZ";

    placeholder.appendChild(placeholderText);

    return placeholder;
}


/*
    콘텐츠 데이터 하나를 카드 요소로 변환합니다.
*/
function createCategoryCard(content, filters) {
    const card = document.createElement("a");
    const cardBody = document.createElement("div");
    const categoryText = document.createElement("p");
    const title = document.createElement("h3");

    card.className =
        "content-card category-content-card";

    card.href = content.link || "#";
    card.dataset.category = content.subcategory || "";

    cardBody.className = "content-card-body";

    categoryText.className = "content-card-category";
    categoryText.textContent = getCategoryFilterLabel(
        filters,
        content.subcategory
    );

    title.className = "content-card-title";
    title.textContent = content.title || "제목 없음";

    cardBody.appendChild(categoryText);
    cardBody.appendChild(title);

    card.appendChild(createCategoryThumbnail(content));
    card.appendChild(cardBody);

    return card;
}


/*
    데이터 파일의 모든 콘텐츠를 카드로 생성합니다.
*/
function renderCategoryCards(contents, filters) {
    const contentGrid =
        document.getElementById("categoryContentGrid");

    if (!contentGrid) {
        return;
    }

    const fragment = document.createDocumentFragment();

    contents.forEach((content) => {
        if (!content || typeof content !== "object") {
            return;
        }

        fragment.appendChild(
            createCategoryCard(content, filters)
        );
    });

    contentGrid.replaceChildren(fragment);
}


/*
    선택한 필터에 맞는 카드만 표시합니다.

    all을 선택하면 모든 콘텐츠가 표시됩니다.
    그 외에는 content.subcategory 값이
    선택한 필터 ID와 같은 콘텐츠만 표시됩니다.
*/
function updateCategoryFilter(selectedFilter, filters) {
    const filterButtons =
        document.querySelectorAll(
            ".category-filter-button[data-filter]"
        );

    const contentCards =
        document.querySelectorAll(
            ".category-content-card[data-category]"
        );

    const resultCount =
        document.querySelector(
            "[data-filter-result-count]"
        );

    const emptyMessage =
        document.getElementById("categoryEmptyMessage");

    let visibleCount = 0;

    filterButtons.forEach((button) => {
        const isActive =
            button.dataset.filter === selectedFilter;

        button.classList.toggle(
            "is-active",
            isActive
        );

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });

    contentCards.forEach((card) => {
        const shouldShow =
            selectedFilter === "all" ||
            card.dataset.category === selectedFilter;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCount += 1;
        }
    });

    if (emptyMessage) {
        emptyMessage.hidden = visibleCount !== 0;
    }

    if (!resultCount) {
        return;
    }

    const filterLabel = getCategoryFilterLabel(
        filters,
        selectedFilter
    );

    resultCount.textContent =
        selectedFilter === "all"
            ? `전체 ${visibleCount}개`
            : `${filterLabel} ${visibleCount}개`;
}


/*
    필터 버튼 클릭 이벤트를 연결합니다.
*/
function initializeCategoryFilter(filters) {
    const filterContainer =
        document.getElementById("categoryFilter");

    if (!filterContainer) {
        return;
    }

    filterContainer.addEventListener(
        "click",
        (event) => {
            const clickedButton =
                event.target.closest(
                    ".category-filter-button[data-filter]"
                );

            if (!clickedButton) {
                return;
            }

            updateCategoryFilter(
                clickedButton.dataset.filter,
                filters
            );
        }
    );

    updateCategoryFilter("all", filters);
}


/*
    대분류 허브 페이지를 초기화합니다.
*/
function initializeCategoryPage() {
    const pageData = getCategoryPageData();

    renderCategoryFilterButtons(pageData.filters);

    renderCategoryCards(
        pageData.contents,
        pageData.filters
    );

    initializeCategoryFilter(pageData.filters);
}


document.addEventListener(
    "DOMContentLoaded",
    initializeCategoryPage
);
