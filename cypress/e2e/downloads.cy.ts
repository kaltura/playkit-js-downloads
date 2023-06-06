describe('download plugin', () => {
  it('passes', () => {
    cy.visit('index.html');
  });
  it('should invoke pre-download hook before download starts');
  it('should download');

  describe('overlay icon', () => {
    describe('on media loaded', () => {
      it('should be visible if download is enabled');
      it('should be hidden if download is not enabled');
    });

    describe('on media change', () => {
      it('should be visible if download is enabled');
      it('should be hidden if download is not enabled');
    });
  });

  describe('download button', () => {
    describe('click', () => {
      describe('on download success', () => {
        it('should invoke pre-download hook');
        it('should fetch a specific flavor');
        it('should show a success notification');
      });

      describe('on download failure', () => {
        it('should show an error notification');
      });
    });
  });
});
