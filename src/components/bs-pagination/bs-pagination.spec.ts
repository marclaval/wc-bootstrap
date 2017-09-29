describe('Pagination component', () => {

  let placeholder = null;
  function createComponent(html: string): Promise<HTMLElement> {
    placeholder = document.createElement('div');
    placeholder.innerHTML = html;
    document.body.appendChild(placeholder);

    return new Promise((resolve,reject) => {
      let hasChanged = false;
      const observerConfig = {childList: true, subtree: true};
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          hasChanged = true;
          observer.disconnect();
          resolve(placeholder);
        });
      });

      setTimeout(()=>{
          if (!hasChanged) {
            observer.disconnect();
            reject(placeholder);
          }
        },2000);
      observer.observe(placeholder, observerConfig);
    });
  }

  afterEach(() => {
    document.body.removeChild(placeholder);
    placeholder = null;
  });

  it('should render', (done) => {
    createComponent('<bs-pagination collection-size="70">Foo</bs-pagination>').then((cpt) => {
      expect(cpt.querySelectorAll('li').length).toEqual(9);
      done();
    });
  });
});