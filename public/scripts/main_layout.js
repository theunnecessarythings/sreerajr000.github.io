import {
  w2layout,
  w2sidebar,
  w2ui,
  query,
  w2toolbar,
  w2utils,
} from "https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js";

const defaultTabs = [{ id: "home", text: "Home" }];

function loadTabs() {
  var savedTabs = sessionStorage.getItem("tabs");
  return savedTabs ? JSON.parse(savedTabs) : defaultTabs;
}

function setMetaTitle() {
  var hash = window.location.hash || "#/home"; // Default to home if no hash
  var page = hash.replace("#/", "");
  let pageTitle = document.head.querySelector('meta[property="og:title"]');
  pageTitle.setAttribute("content", page);
}

// Handle hash-based navigation
function loadPageFromHash() {
  var hash = window.location.hash || "#/home"; // Default to home if no hash
  var page = hash.replace("#/", "");
  let tabs = w2ui.layout_main_tabs;

  if (tabs.get(page)) {
    tabs.click(page);
  } else {
    tabs.add({ id: page, text: page, closable: true });
    tabs.click(page);
  }

  setMetaTitle();
  // layout.load("main", `${page}.html`); // Load the corresponding page
  sessionStorage.setItem("activeTab", page);
}

// widget configuration
let config = {
  layout: {
    name: "layout",
    padding: 0,
    panels: [
      { type: "left", size: 200, resizable: false, minSize: 70 },
      {
        type: "main",
        style:
          "background: radial-gradient(circle, rgba(24,32,44,1) 0%, rgba(16,21,29,1) 86%); border: 1px solid rgb(16, 21, 29); border-top: 0px; border-left: 0; padding: 10px;",
        tabs: {
          active: "home",
          tabs: loadTabs(),
          onClick(event) {
            window.location.hash = `#/${event.target}`;
            layout.load("main", event.target + "/index.html");
            sessionStorage.setItem("activeTab", event.target);
            sessionStorage.setItem(
              "tabs",
              JSON.stringify(w2ui.layout_main_tabs.tabs),
            );
            setMetaTitle();
          },
          onClose(event) {
            if (event.detail.tab.id == this.active) {
              this.click("home");
              window.location.hash = "#/home";
              sessionStorage.setItem("activeTab", "home");
            }
            sessionStorage.setItem(
              "tabs",
              JSON.stringify(
                this.tabs.filter((tab) => tab.id != event.detail.tab.id),
              ),
            );
            setMetaTitle();
          },
        },
      },
      {
        type: "bottom",
        size: 30,
        resizable: false,
        style:
          "background: linear-gradient(90deg, rgba(16,21,29,1) 0%, rgba(37,35,73,1) 86%); border-top: 1px solid rgb(46, 60, 81);",
      },
    ],
  },
  sidebar: {
    box: "#sidebar",
    name: "sidebar",
    levelPadding: 20,
    // flatButton: true,
    flat: true,
    nodes: [
      {
        id: "menu",
        text: "Menu",
        expanded: true,
        group: true,
        groupShowHide: false,
        nodes: [
          { id: "home", text: "Home", icon: "fa fa-home", selected: true },
          { id: "projects", text: "Projects", icon: "fa fa-layer-group" },
          { id: "blog", text: "Blog", icon: "fa fa-blog" },
          { id: "publications", text: "Publications", icon: "fa fa-newspaper" },
          { id: "gallery", text: "Gallery", icon: "fa fa-images" },
          {
            id: "about",
            text: "About",
            icon: "fa fa-info",
          },
        ],
      },
    ],
    onClick(event) {
      let tabs = w2ui.layout_main_tabs;
      if (tabs.get(event.target)) {
        tabs.click(event.target);
      } else {
        tabs.add({ id: event.target, text: event.target, closable: true });
        tabs.click(event.target);
      }
      window.location.hash = `#/${event.target}`;
      setMetaTitle();
    },
    onFlat(event) {
      layout.sizeTo("left", event.detail.goFlat ? 70 : 200, true);
    },
    onRender(event) {
      layout.sizeTo("left", 70, true);
    },
  },
};

let layout = new w2layout(config.layout);
let sidebar = new w2sidebar(config.sidebar);
layout.render("#main");
layout.html("left", sidebar);
layout.html(
  "bottom",
  '<p style="margin: 4px; color: #ccc; font-size: 0.8em; font-family: OpenSans;">Sreeraj Ramachandran</p>',
);

window.loadSearchPage = function () {
  window.location.hash = "#/search";
  let searchValue = document.getElementById("searchInput").value;
  layout.load("main", "search/index.html").then(() => {});
};

let toolbar = new w2toolbar({
  box: "#toolbar",
  name: "toolbar",
  tooltip: "top",
  items: [
    {
      type: "html",
      id: "item5",
      html(item) {
        let html =
          "<form onsubmit='event.preventDefault()' >" +
          '    <input size="24" placeholder="Search" id="searchInput" ' +
          '         style="color: white; background-color: #07101ce6; padding: 4px; border-radius: 4px; border: 1px solid rgb(46, 60, 81)" value="' +
          (item.value || "") +
          '"/>' +
          '<button type="submit" style="color: white; background-color: #07101ce6; padding: 4px; border-radius: 4px; border: 1px solid rgb(46, 60, 81)" ' +
          // "onclick=\"var searchValue = document.getElementById('searchInput').value; window.location.href = '#/search?query=' + encodeURIComponent(searchValue); location.reload();\">" +
          "onclick='loadSearchPage()'>" +
          '    <i class="fa fa-search"></i>' +
          "</button>" +
          "</form>";
        return html;
      },
    },
  ],
  onClick(event) {
    let text = event.detail.item.text;
    let sub = event.detail.subItem;
    if (typeof text == "function") text = text(event.detail.item);
  },
  onChange(event) {},
});

// Listen for hash changes and load the correct page
// TODO: Double loads the page, need to fix this

// document.addEventListener("hashchange", function () {
//   console.log("Hash changed: ", window.location.hash);
//   // call loadPageFromHash() only when its not home page
//   if (window.location.hash != "#/home") {
//     loadPageFromHash();
//   }
// });

// Load the page based on the initial hash on page load
window.addEventListener("load", loadPageFromHash);
