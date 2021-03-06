import throttle from 'lodash/throttle';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);

    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);

    this.onUrlHashChanged();
  }

  onScroll(evt) {
    const currentPosition = this.activeScreen;
    this.reCalculateActiveScreenPosition(evt.deltaY);
    if (currentPosition !== this.activeScreen) {
      this.changePageDisplay();
    }
  }

  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex((screen) => location.hash.slice(1) === screen.id);
    this.activeScreen = (newIndex < 0) ? 0 : newIndex;
    this.changePageDisplay();
  }

  changePageDisplay() {
    this.displayVisibilityHandler();
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  toggleSectionBg(force) {
    const sectionBg = document.querySelector(`.section-background`);
    sectionBg.classList.toggle(`section-background--active`, force);
  }

  animateFromStoryToPrizes() {
    const delay = 500;
    this.toggleSectionBg(true);
    setTimeout(() => {
      this.changeVisibilityDisplay();
      this.toggleSectionBg(false);
    }, delay);
  }

  displayVisibilityHandler() {
    const prizesId = 2;
    const isStoryPrizesChange = Array.from(this.screenElements).some((screen) => {
      const storyClassName = `screen--story`;
      const activeClassName = `active`;
      return (
        screen.classList.contains(storyClassName)
        && screen.classList.contains(activeClassName)
        && this.activeScreen === prizesId
      );
    });

    if (isStoryPrizesChange) {
      this.animateFromStoryToPrizes();
    } else {
      this.changeVisibilityDisplay();
    }
  }

  changeVisibilityDisplay() {
    const activeClassName = `active`;
    const hiddenClassName = `screen--hidden`;
    this.screenElements.forEach((screen) => {
      screen.classList.add(hiddenClassName);
      screen.classList.remove(activeClassName);
    });
    this.screenElements[this.activeScreen].classList.remove(hiddenClassName);
    this.screenElements[this.activeScreen].classList.add(activeClassName);
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find((item) => item.dataset.href === this.screenElements[this.activeScreen].id);
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        'screenId': this.activeScreen,
        'screenName': this.screenElements[this.activeScreen].id,
        'screenElement': this.screenElements[this.activeScreen]
      }
    });

    document.body.dispatchEvent(event);
  }

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }
}
