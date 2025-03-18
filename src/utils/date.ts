// date中添加format方法, 格式化日期, 参数为yyyy-MM-dd
export default function formatDate(date: Date, format: string = 'yyyy-MM-dd') {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return format
    .replace('yyyy', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('dd', day.toString().padStart(2, '0'));
}
