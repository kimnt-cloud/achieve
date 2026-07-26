const menuButton = document.getElementById("menuButton");
const closeMenuButton = document.getElementById("closeMenuButton");
const sidebar = document.getElementById("sidebar");
const pageOverlay = document.getElementById("pageOverlay");
const searchButton = document.getElementById("searchButton");


function openSidebar() {
    sidebar.classList.add("open");
    pageOverlay.classList.add("show");
    document.body.classList.add("menu-open");

    menuButton.setAttribute("aria-expanded", "true");
}


function closeSidebar() {
    sidebar.classList.remove("open");
    pageOverlay.classList.remove("show");
    document.body.classList.remove("menu-open");

    menuButton.setAttribute("aria-expanded", "false");
}


menuButton.addEventListener("click", openSidebar);

closeMenuButton.addEventListener("click", closeSidebar);

pageOverlay.addEventListener("click", closeSidebar);


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeSidebar();
    }
});


searchButton.addEventListener("click", function () {
    alert("검색 기능은 다음 단계에서 추가할 예정입니다.");
});
