let cookie = db.get('channel').value()[0].cookie
var checkCopyright = async function () {
    ipcRenderer.send("RUN_CHECK_COPYRIGHT", { cookie })
}
ipcRenderer.on("RESULT_CHECK_COPYRIGHT", async (event, arg) => {
    if (!arg.resultCheck) {
        showAbout("info", "Thông Báo", "Đã xảy ra lỗi");
    } else {
        var uri = 'data:application/vnd.ms-excel;base64,';
        var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
        var base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        };

        var format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        };

        var htmls = `
        <tr>
            <th style="width: 300px">Tên video</th>
            <th style="width: 200px">Bản quyền</th>
        </tr>
    `;

        arg.resultCheck.forEach(item => {
            htmls += `
            <tr>
                <td>${item.name}</td>
                <td>${item.status}</td>
            </tr> 
        `
        });

        var ctx = {
            worksheet: 'Worksheet',
            table: htmls
        }

        var link = document.createElement("a");
        link.download = "Kiểm tra bản quyền.xls";
        link.href = uri + base64(format(template, ctx));
        link.click();
    }
});