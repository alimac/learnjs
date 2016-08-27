describe('LearnJS', function () {

  describe('changing views', function() {

    it('can show a problem view', function () {
      learnjs.showView('#problem-1');
      expect($('.view-container .problem-view').length).toEqual(1);
    });

    it('triggers removingView event when removing the view', function() {
      spyOn(learnjs, 'triggerEvent');
      learnjs.showView('#problem-1');
      expect(learnjs.triggerEvent).toHaveBeenCalledWith('removingView',[]);
    });

  });

  it('shows the landing page view when there is no hash', function () {
    learnjs.showView('');
    expect($('.view-container .landing-view').length).toEqual(1);
  });

  it('passes the hash view parameter to the view function', function () {
    spyOn(learnjs, 'problemView');
    learnjs.showView('#problem-42');
    expect(learnjs.problemView).toHaveBeenCalledWith('42');
  });

  it('invokes the router when loaded', function () {
    spyOn(learnjs, 'showView');
    learnjs.appOnReady();
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  it('subscribes to the hash change event', function () {
    learnjs.appOnReady();
    spyOn(learnjs, 'showView');
    $(window).trigger('hashchange');
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  it('can redirect to the main view after the last problem is answered',
    function() {
      var flash = learnjs.buildCorrectFlash(learnjs.problems.length);
      expect(flash.find('a').attr('href')).toEqual("");
      expect(flash.find('a').text()).toEqual("You're finished!");
  });

  it('can trigger custom events on a view', function() {
    callback = jasmine.createSpy('callback');
    var div = $('<div>').bind('fooEvent', callback);
    $('.view-container').append(div);
    learnjs.triggerEvent('fooEvent', ['bar']);
    expect(callback).toHaveBeenCalled();
    expect(callback.calls.argsFor(0)[1]).toEqual('bar');
  });

  describe('problem view', function () {
    var view;
    beforeEach(function(){
      view = learnjs.problemView('1');
    });

    it('has a title that includes the problem number', function () {
      expect(view.find('.title').text()).toEqual('Problem #1');
    });

    it('shows the description', function() {
      expect(view.find('[data-name="description"]').text()).toEqual(
        'What is truth?');
    });

    it('shows the problem code', function() {
      expect(view.find('[data-name="code"]').text()).toEqual(
        'function problem() { return __; }');
    });

    describe('answer section', function() {
      var resultFlash;

      beforeEach(function() {
        spyOn(learnjs, 'flashElement');
        resultFlash = view.find('.result');
      });

      describe('when the answer is correct', function() {
        beforeEach(function(){
          view.find('.answer').val('true');
          view.find('.check-btn').click();
        });

        it('flashes the result', function () {
          var flashArgs = learnjs.flashElement.calls.argsFor(0);
          expect(flashArgs[0]).toEqual(resultFlash);
          expect(flashArgs[1].find('span').text()).toEqual('Correct!');
        });

        it('contains the link to the next problem', function(){
          var link = learnjs.flashElement.calls.argsFor(0)[1].find('a');
          expect(link.attr('href')).toEqual('#problem-2');
          expect(link.text()).toEqual('Next Problem');
        });
      });

      it('rejects an incorrect answer', function(){
        view.find('.answer').val('false');
        view.find('.check-btn').click();
        expect(learnjs.flashElement).toHaveBeenCalledWith(
          resultFlash, 'Incorrect!');
      });
    });


    describe('skip button', function() {
      it('is added to the navbar when the view is added', function() {
        expect($('.nav-list .skip-btn').length).toEqual(1);
      });

      it('is removed from the navbar when the view is removed', function() {
        view.trigger('removingView');
        expect($('.nav-list .skip-btn').length).toEqual(0);
      });

      it('contains a link to the next problem', function() {
        expect($('.nav-list .skip-btn a').attr('href')).toEqual('#problem-2');
      });

      it('does not added when at the last problem', function() {
        view.trigger('removingView');
        view = learnjs.problemView(learnjs.problems.length);
        expect($('.nav-list .skip-btn').length).toEqual(0);
      });
    });


  });
});