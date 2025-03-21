import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";
import AddStoryPage from "../pages/stories/add-stories-page";

const routes = {
  "/": HomePage,
  "/about": AboutPage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add-story": AddStoryPage,
};

const changePage = async (PageClass) => {
  if (!PageClass || typeof PageClass !== "function") {
    console.error("PageClass is invalid!");
    return;
  }

  const pageInstance = new PageClass();
  const mainContent = document.getElementById("main-content");

  if (!pageInstance.render || typeof pageInstance.render !== "function") {
    console.error("pageInstance.render is not a function!");
    return;
  }

  if (typeof document.startViewTransition === "function") {
    await document.startViewTransition(async () => {
      const newContent = await pageInstance.render();
      mainContent.innerHTML = newContent;

      if (pageInstance.afterRender) {
        await pageInstance.afterRender();
      }
    });
  } else {
    mainContent.innerHTML = await pageInstance.render();
    if (pageInstance.afterRender) {
      await pageInstance.afterRender();
    }
  }
};

const router = async () => {
  const hash = window.location.hash.replace("#", "") || "/";
  const PageClass = routes[hash] || HomePage;
  await changePage(PageClass);
};

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

export default router;
