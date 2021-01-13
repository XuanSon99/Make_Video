function showListChannel() {
    let mList = db.get("channel").value()
    console.log({mList})
    let html = "";
    let k = 1;

    for (let item of mList) {
        // let listVideo = "";
        // for (const iterator of item.info_link.info_clone.videos) {
        //     listVideo += `<p>${iterator}</p>`
        // }
        //  <p>Mô tả Channel: ${item.info_link.info_clone.metadata.description}</p>   
        //<p>Keywords Channel: ${item.info_link.info_clone.metadata.keywords}</p>
        //<td>${JSON.stringify(item.cookie).substr(0, 200)}...</td>
        html += `
            <tr>
                <td >
                    <div class="form-check-inline">
                        <label class="form-check-label">
                        <input type="checkbox" value="${item.id}" class="form-check-input channel_item">
                        </label>
                    </div>
                </td>    
                <td style="width:50%;">
                    <p>Tên Channel: ${item.info_link.info_clone.metadata.title}</p>
                   
                    
                    <p>Ảnh Nền, Ảnh Đại Diện: <img width="200" src="${item.info_link.info_clone.header.thumbnails[0].url}"></p>
                    
                    ${item.link}
                </td>    
                <td></td>   
            </tr>
        
        `;
    }
    // console.log(html)
    $("table>tbody").html(html)
}

showListChannel();


var isRunDowloadVideo = false;

function checkAllAccount() {
    if ($('.check_all').is(":checked")) {
        $(".channel_item").prop("checked", true)
    } else {
        $(".channel_item").prop("checked", false)
    }
}

var listChannelNeedDowload = [];

function dowloadVideo() {

    $(".channel_item").each(function () {
        if ($(this).is(":checked")) {
            listChannelNeedDowload.push($(this).val())
        }
    });
    // console.log({listChannelNeedDowload});
    // return false;
    if (listChannelNeedDowload.length < 1) {
        showAbout("error", "Thông Báo", "Phải chọn channel cần tải video!");
        return true;
    }
    $("#runDowloadVideo").prop("disabled", true);
    $("#stopDowloadVideo").prop("disabled", false);
    $("#runDowloadVideo").html(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span class="sr-only">Đang Chạy...</span>
    `);
    isRunDowloadVideo = true;
    LoopRunDownload().then();
    // console.log(listChannelNeedDowload)
}

function StopdowloadVideo() {
    $("#runDowloadVideo").prop("disabled", false);
    $("#stopDowloadVideo").prop("disabled", true);
    $("#runDowloadVideo").html(`
        Chạy Tải Video
    `);
    isRunDowloadVideo = false;
}

async function LoopRunDownload() {
    if (listChannelNeedDowload.length < 1) {
        StopdowloadVideo();
        showAbout("info", "Thông Báo", "Hoàn Thành Tải video!");
        return true;
    }
    if (!isRunDowloadVideo) {
        showAbout("error", "Thông Báo", "Đã dừng download video!");
        return true;
    }
    let id = listChannelNeedDowload[0];
    listChannelNeedDowload.splice(0, 1);
    let listVideoChannelClone = db.get("video").filter({channel_id: id}).sortBy("created_at").value();
    let listVideos = listVideoChannelClone;
    if (!listVideos || listVideos.length < 1) {
        LoopRunDownload().then();
    }
    console.log({listVideos});

    // ipcRenderer.send("RUN_DOWNLOAD_VIDEO_YOUTUBE", {listVideos, channel_id: id})
}

ipcRenderer.on("RESULT_DOWNLOAD_VIDEO_YOUTUBE", async (event, arg) => {
    console.log("RESULT_DOWNLOAD_VIDEO_YOUTUBE", arg);
    if (arg.status) {
        let channel_id = arg.channel_id;
        if (arg.result.length > 0) {
            for (let item of arg.result) {
                if (item.status) {
                    if (item.values.length > 0) {
                        for (let item1 of item.values) {
                            if (item1.status) {
                                let dataVideoAdd = {
                                    id: uuid.v4(),
                                    videoName: item1.videoName,
                                    videoCode: item1.videoCode,
                                    channel_id,
                                    id_upload: false,
                                    is_download: true
                                };
                                // check video Code
                                let checkVideoCode = db.get("video").find({videoCode: item1.videoCode}).value();
                                console.log({checkVideoCode});
                                // if (!checkVideoCode) {
                                //     db.get('video')
                                //         .push(dataVideoAdd)
                                //         .write()
                                // } else {
                                //     db.get('posts')
                                //         .find({id: checkVideoCode.id})
                                //         .assign({is_download: true})
                                //         .write()
                                // }
                                // console.log(({dataVideoAdd}))
                            }
                        }
                    }
                }
            }
        }
    }
    LoopRunDownload().then();
});

ipcRenderer.on("RELOAD_LIST_CHANNEL", async (event, arg) => {
    console.log("RELOAD_LIST_CHANNEL")
    // showListChannel();
    document.re
});