// jshint esversion: 6

document.addEventListener("DOMContentLoaded", function() {
   "use strict";

   let pageIndex = Number(localStorage.getItem("pageIndex")) || 1;
   let touchVisibilityTimeout = null;

   let background = document.querySelector(".background");
   let comic = document.querySelector(".comic");
   let pageDisplay = document.querySelector(".page");
   let goLeftButton = document.querySelector(".goLeft");
   let goRightButton = document.querySelector(".goRight");
   let setIndexButton = document.querySelector(".setIndex");

   let bodyHammer = new Hammer(document.body);
   let comicHammer = new Hammer(comic);
   let goLeftHammer = new Hammer(goLeftButton);
   let goRightHammer = new Hammer(goRightButton);
   let setIndexHammer = new Hammer(setIndexButton);

   function setTouchVisibility(visible) {
      clearTimeout(touchVisibilityTimeout);

      if (visible) {
         document.querySelectorAll(".touch-visible").forEach(it => it.classList.add("visible"));
         touchVisibilityTimeout = setTimeout(() => setTouchVisibility(false), 2500);
      } else {
         document.querySelectorAll(".touch-visible").forEach(it => it.classList.remove("visible"));
         touchVisibilityTimeout = null;
      }
   }

   function setPage(newPageIndex) {
      pageIndex = newPageIndex;
      localStorage.setItem("pageIndex", pageIndex);
      pageDisplay.innerHTML = `<span>Page ${pageIndex}</span>`;

      let comicUrl = getUrl(pageIndex);
      background.style.backgroundImage = `url('${comicUrl}')`;
      comic.style.backgroundImage = `url('${comicUrl}')`;

      preloadImage(getUrl(pageIndex + 1));
      preloadImage(getUrl(pageIndex - 1));
   }

   function nextPage() {
      setPage(++pageIndex);
   }

   function prevPage() {
      setPage(--pageIndex);
   }

   function getUrl(index) {
      return `http://www.darthsanddroids.net/comics/darths${String(index).padStart(4, "0")}.jpg`;
   }

   function preloadImage(url) {
      (new Image()).src = url;
   }

   function createBinds() {
      comicHammer.on("tap", () => setTouchVisibility(true));

      // Pagination
      bodyHammer.on("swipeleft", () => nextPage());
      bodyHammer.on("swiperight", () => prevPage());
      goLeftHammer.on("tap", () => {
         // Keep showing touch controls
         setTouchVisibility(true);
         prevPage();
      });
      goRightHammer.on("tap", () => {
         // Keep showing touch controls
         setTouchVisibility(true);
         nextPage();
      });
      window.addEventListener("keyup", e => {
         switch (e.code) {
            case "ArrowLeft":
               prevPage();
               break;

            case "ArrowRight":
               nextPage();
               break;

            default:
               break;
         }
      });

      setIndexHammer.on("tap", () => {
         // Keep showing touch controls
         setTouchVisibility(true);
         // Prevent tap from immediately closing dialog
         setTimeout(() =>
            vex.dialog.prompt({
               message: "Go To Page",
               placeholder: "157",
               callback: newPage => {
                  if (newPage && !isNaN(Number(newPage)) && Number(newPage) >= 0) {
                     setPage(Number(newPage));
                  }
               }
            }), 50);
      });
   }

   createBinds();
   setPage(pageIndex);
});
