let loading = document.getElementById("createVideo");
let listAudio = []

const uploadFile = (event) => {
    let code = document.getElementById('code')
    listAudio = event.target.files;
    let nameList = [];
    for (let i = 0; i < listAudio.length; i++) {
        nameList.push(" " + listAudio[i].name);
        code.value = nameList;
    }
}

var createVideo = async function () {
    if (!listAudio[0]) {
        showAbout("info", "Thông Báo", "Vui lòng chọn file");
        return;
    }
    loading.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
    var list = [];
    for (let i = 0; i < listAudio.length; i++) {
        list.push({
            path: listAudio[i].path,
            name: listAudio[i].name
        })
    }
    ipcRenderer.send("RUN_CREATE_VIDEO", { list })
}
ipcRenderer.on("RESULT_CREATE_VIDEO", async (event, arg) => {
    console.log(arg);
    if (arg.result[0]) {
        showAbout("info", "Thông Báo", "Tạo video thành công");
        loading.innerHTML = "Tạo video"
        document.getElementById('code').value = ""
        listAudio = []
        arg.result.forEach(item => {
            db.get('video')
            .push(item)
            .write();
        });
    } else {
        showAbout("info", "Thông Báo", "Đã xảy ra lỗi");
        loading.innerHTML = "Tạo video"
    }
})