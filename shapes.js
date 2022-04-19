export let pieces = {
    "l": {
        "shape": [[
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [0, 0, 1],
            [1, 1, 1]
        ]],
        "bgcolor": '#448'
    },
    "rl": {
        "shape": [[
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1]
        ]],
        "bgcolor": "#825"
    },
    "long": {
        "shape": [[
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ]],
        "bgcolor": "#48d"
    },
    "s": {
        "shape": [[
            [0, 0, 0],
            [0, 1, 1],
            [1, 1, 0]
        ],
        [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]],
        "bgcolor": "#3d4"
    },
    "rs": {
        "shape": [[
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0]
        ]],
        "bgcolor": "#ba3"
    },
    "t": {
        "shape": [[
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]],
        "bgcolor": "#b3a"
    },
    "block": {
        "shape": [[
            [1, 1],
            [1, 1]
        ]],
        "bgcolor": "#baa"
    }
}

export function randomPiece(nums) {
    let list = []
    for(let k = 0; k < Object.keys(nums).length; k++){
        let key = Object.keys(nums)[k];
        for (let i = 0; i < nums[key]; i++){
            list.push(k)
        }
    }
    console.log(list);
    let index = list[Math.round(Math.random() * (list.length - 1))];
    let shape = Object.keys(nums)[index];
    for (let i = 0; i < Object.keys(nums).length; i++){
        if(Object.keys(nums)[i] != shape){
            if (nums[Object.keys(nums)[i]] < 5){
                nums[Object.keys(nums)[i]] += 1;
            }
        }else{
            nums[Object.keys(nums)[i]] = 0;
        }
    }
    return pieces[shape];
}

export function pickpiece(nums, shape){
    for (let i = 0; i < Object.keys(nums); i++){
        if(Object.keys(nums)[i] != shape){
            nums[Object.keys(nums)[i]] += 1;
        }else{
            nums[Object.keys(nums)[i]] = 0;
        }
    }
    return pieces[shape];
}