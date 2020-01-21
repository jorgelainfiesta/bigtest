import { expect } from 'chai';
import { useFixture } from './helpers/useFixture';
import { interactor } from '~';
import { button, css, inputByType, input } from './helpers/selectors';

describe('interactor()', () => {
  describe('basics', () => {
    const Button = interactor(button, ({ subject }) => ({
      async press() {
        await subject.first().click();
      }
    }));
    const Element = interactor(css);

    useFixture('form-fixture');

    it('works', async () => {
      expect(await Element('#result').getText()).to.eq('not ok');
      await Button('Submit').click();
      expect(await Element('#result').getText()).to.eq('ok');
    });

    it('has custom actions', async () => {
      expect(await Element('#result').getText()).to.eq('not ok');
      await Button('Submit').press();
      expect(await Element('#result').getText()).to.eq('ok');
    });
  });

  describe('multiple matches', () => {
    const Input = interactor(inputByType, ({ subject }) => ({
      async getValues() {
        const elems = await subject.all();
        return Promise.all(elems.map(el => el.getValue()));
      }
    }));

    useFixture('form-fixture');

    it('works', async () => {
      expect(await Input('hidden').getValues()).to.deep.eq(['foo', 'bar']);
    });
  });
});