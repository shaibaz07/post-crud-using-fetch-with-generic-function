const cl = console.log;


const postForm = document.getElementById('postForm');
const postContainer = document.getElementById('postContainer');

const title = document.getElementById('title')
const author = document.getElementById('author')
const content = document.getElementById('content')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')
const spinner = document.getElementById('spinner')



const BaseUrl = `https://studentpost-5eee3-default-rtdb.asia-southeast1.firebasedatabase.app`
const postUrl = `${BaseUrl}/postWithGeneric.json`

const state = {
    postArr: [],
    editid: null
}

function ObjtoArr(obj) {
    for (const key in obj) {
        obj[key].id = key,
            state.postArr.unshift(obj[key])


    }
}

function snackBar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500
    })
}

function showSpinner() {
    spinner.classList.remove('d-none')
}

function hideSpinner() {
    spinner.classList.add('d-none')
}

function makeApiCall(Url, method, body) {
    body = body ? JSON.stringify(body) : null

    return fetch(Url, {
        method: method,
        body: body,
        headers: {
            "Content-Type": "application/json",
            "auth": "JWT Token"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error();
            }
            return res.json()
        })
}


function readPost(arr) {

    let result = ``
    arr.forEach(post => {

        result += `
                     <div class="col-md-4  mb-4" id="${post.id}">
                        <div class="card h-100">
                            <div class="card-header bg-success text-white">
                                <h3>
                                    ${post.title}
                                </h3>
                            </div>
                            <div class="card-body">
                                    <h5>${post.author}</h5>
                                <p>${post.content}</p>
                                
                            </div>
                            <div class="card-footer d-flex justify-content-between">
                                <button onclick= "onPostEdit(this)" class="btn btn-dark btn-sm">Edit</button>
                                <button onclick="onPostRemove(this)" class="btn btn-danger btn-sm">Remove</button>

                            </div>
                        </div>
                    </div>
            
        
                `
        postContainer.innerHTML = result

    });
}


function fetchPost() {
    showSpinner()
    makeApiCall(postUrl, "GET")
        .then(res => {
            ObjtoArr(res)
            readPost(state.postArr)
        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}


fetchPost()







function onPostAdd(eve) {
    eve.preventDefault()

    let newPost = {
        title: title.value,
        author: author.value,
        content: content.value,
    }
    showSpinner()
    makeApiCall(postUrl, "POST", newPost)
        .then(res => {
            newPost.id = res.name

            state.postArr.unshift(newPost)

            let col = document.createElement('div')
            col.classList = `col-md-4  mb-4`
            col.id = res.name;

            col.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h3>
                                ${newPost.title}
                            </h3>
                        </div>
                        <div class="card-body">
                                <h5>${newPost.author}</h5>
                            <p>${newPost.content}</p>
                            
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button onclick= "onPostEdit(this)" class="btn btn-primary btn-sm">Edit</button>
                            <button onclick="onPostRemove(this)" class="btn btn-danger btn-sm">Remove</button>

                        </div>
                    </div>
            
                        
                        `
            postForm.reset()
            postContainer.prepend(col)
            snackBar(`New Post with id: ${res.name} is added successfully!!!`, "success")

        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}


function onPostEdit(ele) {
    let editId = ele.closest('.col-md-4').id;
    state.editid = editId;

    let editObj = state.postArr.find(p => p.id === editId)

    title.value = editObj.title;
    author.value = editObj.author;
    content.value = editObj.content

    addPostBtn.classList.add('d-none')
    updatePostBtn.classList.remove('d-none')

}

function onPostUpdate() {
    let updateId = state.editid;
    let updateUrl = `${BaseUrl}/postWithGeneric/${updateId}.json`
    let updatedObj = {
        title: title.value,
        author: author.value,
        content: content.value,
        id: updateId
    }

    showSpinner()
    makeApiCall(updateUrl, "PATCH", updatedObj)
        .then(res => {
            let updateIdx = state.postArr.findIndex(p => p.id === updateId)
            state.postArr[updateIdx] = updatedObj;

            let col = document.getElementById(updateId)
            col.className = `col-md-4  mb-4`
            col.innerHTML = `
                <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h3>
                                ${updatedObj.title}
                            </h3>
                        </div>
                        <div class="card-body">
                                <h5>${updatedObj.author}</h5>
                            <p>${updatedObj.content}</p>
                            
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button onclick= "onPostEdit(this)" class="btn btn-primary btn-sm">Edit</button>
                            <button onclick="onPostRemove(this)" class="btn btn-danger btn-sm">Remove</button>

                        </div>
                    </div>
            
                    `
            postForm.reset()
            updatePostBtn.classList.add('d-none')
            addPostBtn.classList.remove('d-none')

            snackBar(` Post with id: ${updateId} is updated successfully!!!`, "success")


        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}








function onPostRemove(ele) {
    let removeId = ele.closest('.col-md-4').id


    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        showSpinner()
        let removeUrl = `${BaseUrl}/postWithGeneric/${removeId}.json`

        if (result.isConfirmed) {
            makeApiCall(removeUrl, "DELETE")
                .then(res => {
                    let removeObj = state.postArr.findIndex(p => p.id === removeId)
                    state.postArr.splice(removeObj, 1)

                    ele.closest('.col-md-4').remove()

                    snackBar(` Post with id: ${removeId} is removed successfully!!!`, "success")

                })
                .catch(err => {
                    cl(err)
                })
                .finally(() => {
                    hideSpinner()
                })

        } else {
            hideSpinner()


        }
    });



}



updatePostBtn.addEventListener("click", onPostUpdate)

postForm.addEventListener("submit", onPostAdd)