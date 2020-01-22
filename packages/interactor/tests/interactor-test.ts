import { expect } from 'chai';
import { useFixture } from './helpers/useFixture';
import { interactor } from '~';
import { button, css, inputByType, input } from './helpers/selectors';
import { when } from '~/when';

describe('interactor()', () => {
  const Element = interactor(css);
  const Button = interactor(button, ({ subject }) => ({
    async press() {
      await subject.first().click();
    }
  }));

  useFixture('form-fixture');

  describe('basics', () => {
    it('works', async () => {
      expect(await Element('#result').text).to.eq('not ok');
      await Button('Submit').click();
      expect(await Element('#result').text).to.eq('ok');
    });
  });

  describe('custom actions', () => {
    it('has custom actions', async () => {
      expect(await Element('#result').text).to.eq('not ok');
      await Button('Submit').press();
      expect(await Element('#result').text).to.eq('ok');
    });
  });

  describe('multiple matches', () => {
    const Input = interactor(inputByType, ({ subject }) => ({
      get values() {
        return subject.all().then(elems => Promise.all(elems.map(el => el.value)));
      }
    }));

    it('works', async () => {
      expect(await Input('hidden').values).to.deep.eq(['foo', 'bar']);
    });
  });

  describe('chaining', () => {
    const Input = interactor(input, ({ subject }) => ({
      async upcase() {
        const og = await subject.first().value;
        await subject.first().fill(og.toUpperCase());
      }
    }));

    it('works', async () => {
      expect(
        await Input('Name')
          .fill('foo')
          .fill('bar')
          .upcase().value
      ).to.eq('BAR');
    });
  });

  describe('slow action', () => {
    const Input = interactor(input, ({ subject }) => ({
      async upcase() {
        const og = await subject.first().value;
        await new Promise(resolve => {
          setTimeout(resolve, 200);
        });
        await subject.first().fill(og.toUpperCase());
      }
    }));

    it('works', async () => {
      expect(
        await Input('Name')
          .fill('foo')
          .upcase().value
      ).to.eq('FOO');
    });
  });

  describe('complex interactor', () => {
    const SomeForm = interactor(css, ({ subject }) => ({
      async submit() {
        await Button('Submit', subject).press();
      },
      get result() {
        return Element('#result').text;
      }
    }));

    it('works', async () => {
      expect(await SomeForm('form').result).to.eq('not ok');
      await SomeForm('form').submit();
      await when(async () => expect(await SomeForm('form').result).to.eq('ok'));
    });
  });
});
