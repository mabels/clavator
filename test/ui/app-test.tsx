
// import { assert } from 'chai';
// import * as React from 'react';
// import { shallow } from 'enzyme';

// import { App } from '../../src/ui/app';

// describe('<App />', () => {
//  it("should render 'Hello World'", () => {
//    const wrapper = shallow(<App />);
//    assert.equal(wrapper.text(), 'Hello World');
//  });
// });

// import { expect } from 'expect.js';

import * as React from 'react';
// import * as sinon from 'sinon';
import { expect } from 'chai';
import * as Enzyme from 'enzyme';

import { App } from '../../src/ui/app';
// import { TabList } from 'react-tabs';

import * as Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

function step(msg: string, fn: () => void): void {
  function markRemainingTestsAndSubSuitesAsPending(currentTest: any): void {
      if (currentTest._retries !== -1 && currentTest._currentRetry < currentTest._retries) {
        return;
      }
      const tests = currentTest.parent.tests;
      const suites = currentTest.parent.suites;

      for (let index = tests.indexOf(currentTest) + 1; index < tests.length; index++) {
          const test = tests[index];
          test.pending = true;
      }

      for (let index = 0; index < suites.length; index++) {
          const suite = suites[index];
          suite.pending = true;
      }
  }

  //
  // sync tests
  //

  function sync(): void {

    const context = this;

    try {
      const promise = fn.call(context);
      if (promise != null && promise.then != null && promise.catch != null) {
        return promise.catch(function(err: any): void {
          markRemainingTestsAndSubSuitesAsPending(context.test);
          throw err;
        });
      } else {
        return promise;
      }
    } catch (ex) {
      markRemainingTestsAndSubSuitesAsPending(context.test);
      throw ex;
    }

  }

  //
  // async tests
  //

  function async(done: (err: any) => void): void {
    let context = this;

    function onError(): void {
      markRemainingTestsAndSubSuitesAsPending(context.test);
      process.removeListener('uncaughtException', onError);
    }

    process.addListener('uncaughtException', onError);

    try {
      fn.call(context, function(err: any): void {
        if (err) {
          onError();
          done(err);
        } else {
          process.removeListener('uncaughtException', onError);
          done(null);
        }
      });
    } catch (ex) {
      onError();
      throw ex;
    }

  }

  if (fn == null) {
    it(msg);
  } else if (fn.length === 0) {
    it(msg, sync);
  } else {
    it(msg, async);
  }

}

describe('<App>', () => {
    const wrapper = Enzyme.mount(<App />);
    step('Main Menu', () => {
      expect(wrapper.find('.MainMenu li')).to.have.length(3);
    });

    // step('Assistent Menu', () => {
    //   const assistent = wrapper.find('.MainMenu .Assistent').first();
    //   assistent.simulate('click');
    //   // expect(wrapper.find('div:contains("Warrents-List")')).to.have.length(1);
    //   const warrents_input = wrapper.find('.WarrentsList input[type="text"]');
    //   expect(warrents_input).to.have.length(1);
    //   warrents_input.last().simulate('change', {target: {value: 'David'}});
    //   let warrents_buttons = wrapper.find('.WarrentsList button.add');
    //   expect(warrents_buttons).to.have.length(1);
    //   warrents_buttons.simulate('click');
    //   expect(wrapper.find('.WarrentsList li')).to.have.length(2);
    //   warrents_buttons = wrapper.find('.WarrentsList button.done');
    //   warrents_buttons.last().simulate('click');
    //   [
    //       'expireDate', 'uid.name.0', 'email.0', 'nameComment.0'
    //   ].forEach(t => {
    //     expect(wrapper.find(`.SimpleCreateKey input[name="${t}"]`)).to.have.length(1, t);
    //   });
    //   [
    //       'KeyType', 'MasterKeyLength', 'SubKeyLength'
    //   ].forEach(t => {
    //     expect(wrapper.find(`.SimpleCreateKey select[name="${t}"]`).length).to.have.gte(1, t);
    //   });
    //   // expect(wrapper.find('.SimpleCreateKey button.AddUid').first()).to.have.length(0);
    //   // expect(date_inputs).to.have.length(1);
    // });

    // step('Oops!', () => {
    //   const emailInput = appRoot.find("#emailInput");
    //   const passwordInput = appRoot.find("#passwordInput");
    //   emailInput.simulate("change", {target: {value: "peter@classdojo.co
    // });

    // step('This step will never be run', () => {
    //   // ...nor will its output be displayed in the console.
    // });

});
