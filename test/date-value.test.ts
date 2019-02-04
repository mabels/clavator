import { DateValue, format_date } from '../src/model';

it('date-value round to full day constructor', () => {
  const n = new DateValue(new Date('2018-09-04 17:01:02'), 'what');
  expect(n.date.get()).toEqual(new Date('2018-09-04'));
  expect(n.formatDate.get()).toEqual(format_date(new Date('2018-09-04')));
});

it('date-value round to full day date', () => {
  const n = new DateValue(new Date('2018-07-04 17:01:02'), 'what');
  n.date.set(new Date('2018-09-04 17:01:02'));
  expect(n.date.get()).toEqual(new Date('2018-09-04'));
  expect(n.formatDate.get()).toEqual(format_date(new Date('2018-09-04')));
});

it('date-value round to full day format_date', () => {
  const n = new DateValue(new Date('2018-07-04 17:01:02'), 'what');
  n.formatDate.set('2018-09-04');
  expect(n.date.get()).toEqual(new Date('2018-09-04'));
  expect(n.formatDate.get()).toEqual(format_date(new Date('2018-09-04')));
});

it('date-value round to full day fill', () => {
  const n = new DateValue(new Date('2018-09-04 17:01:02'), 'what');
  expect(n.toObj()).toEqual({
    formatDate: '2018-09-04',
    errText: 'what'
  });
  const filled = new DateValue(new Date('2017-06-06'), 'yo');
  filled.fill(n.toObj());
  expect(filled.date.get()).toEqual(new Date('2018-09-04'));
  expect(filled.formatDate.get()).toEqual(format_date(new Date('2018-09-04')));
  expect(filled.errText).toBe('what');
});

it('date-value round to full day unformated formatDate', () => {
  const n = new DateValue(new Date('2018-07-04 17:01:02'), 'what');
  n.formatDate.set('2018-09-04 17:01:03');
  expect(n.date.get()).toEqual(new Date('2018-09-04'));
  expect(n.formatDate.get()).toEqual(format_date(new Date('2018-09-04')));
});

it('date-value round to full day formatDate by yyyy-mm-dd', () => {
  const n = new DateValue(new Date('2018-07-04 17:01:02'), 'what');
  n.fill({
    errText: 'expireDate error',
    formatDate: '2022-11-17'
  });
  expect(n.date.get()).toEqual(new Date('2022-11-17'));
  expect(n.formatDate.get()).toEqual(format_date(new Date('2022-11-17')));
  expect(n.errText).toBe('expireDate error');
});
