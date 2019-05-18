export const weekData = [
  { value: 1, label: '星期一' },
  { value: 2, label: '星期二' },
  { value: 3, label: '星期三' },
  { value: 4, label: '星期四' },
  { value: 5, label: '星期五' },
  { value: 6, label: '星期六' },
  { value: 7, label: '星期天' },
];

function createData(num) {
  let arr = [];
  for (let i = 1; i < num + 1; i++) {
    let obj = { value: `${i}`, label: `${i}天`, children: [] };
    arr.push(obj);
  }
  return arr;
}

export const everyWeekData = createData(7);
export const everyMonthData = createData(30);
