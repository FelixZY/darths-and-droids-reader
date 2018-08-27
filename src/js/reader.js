// jshint esversion: 6

document.addEventListener("DOMContentLoaded", function() {
   "use strict";

   let pageIndex = Number(localStorage.getItem("pageIndex")) || 1;
   let touchVisibilityTimeout = null;

   let loader = document.querySelector(".loader");
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

   let hasNextPage = false;
   let hasPrevPage = false;

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
      loader.classList.remove("hidden");

      let comicUrl = getUrl(newPageIndex);
      loadImage(comicUrl,
         () => {
            loader.classList.add("hidden");
            background.style.backgroundImage = `url('${comicUrl}')`;
            comic.style.backgroundImage = `url('${comicUrl}')`;

            pageIndex = newPageIndex;
            localStorage.setItem("pageIndex", pageIndex);
            pageDisplay.innerHTML = `<span>Page ${pageIndex}</span>`;

            // Preload surrounding pages
            loadImage(getUrl(newPageIndex + 1),
               () => {
                  hasNextPage = true;
                  goRightButton.classList.remove("hidden");
               },
               () => {
                  hasNextPage = false;
                  goRightButton.classList.add("hidden");
               });
            loadImage(getUrl(newPageIndex - 1),
               () => {
                  hasPrevPage = true;
                  goLeftButton.classList.remove("hidden");
               },
               () => {
                  hasPrevPage = false;
                  goLeftButton.classList.add("hidden");
               });
         },
         () => {
            loader.classList.add("hidden");
            vex.dialog.alert(`Could not find page #${newPageIndex}`);
         });
   }

   function nextPage() {
      if (hasNextPage) {
         setPage(pageIndex + 1);

      }
   }

   function prevPage() {
      if (hasPrevPage) {
         setPage(pageIndex - 1);
      }
   }

   function getUrl(index) {
      return `http://www.darthsanddroids.net/comics/darths${String(index).padStart(4, "0")}.jpg`;
   }

   function loadImage(url, onLoad = null, onError = null) {
      let image = new Image();
      if (onLoad !== null) {
         image.onload = onLoad;
      }
      if (onError !== null) {
         image.onerror = onError;
      }
      image.src = url;
   }

   function createBinds() {
      comicHammer.on("tap", () => setTouchVisibility(touchVisibilityTimeout === null));

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
