import { assert } from 'chai';
import * as React from 'react';
import { shallow } from 'enzyme';

import { App } from '../../src/ui/app';

describe('<App />', () => {
  it("should render 'Hello World'", () => {
    const wrapper = shallow(<App />);
    assert.equal(wrapper.text(), 'Hello World');
  });
});
