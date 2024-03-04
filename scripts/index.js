const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 720;


let type = 'Idle__'
let frame = 0;
let gameframe = 9;
let staggerframe = 5;

function animate(){

    const player = new Image();
    let frame = Math.floor(gameframe/staggerframe)%10;
    player.src = './images/character/ninja/' + type + '00' + frame + '.png';

    player.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(player, 0,0, 200, 200);
    }

    gameframe++;
    requestAnimationFrame(animate);
}
animate();

document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight'){
        type = 'Run__'
    }
    if(e.key === 'ArrowLeft'){
        type = 'Run__'
    }
    if(e.key === 'ArrowUp'){
        if(type === 'Slide__'){
            type = 'Idle__'
        } else{
            type = 'Jump__'
        }
    }
    if(e.key === 'ArrowDown'){
        if(type === 'Jump__'){
            type = 'Idle__'
        } else{
            type = 'Slide__'
        }
    }
    if(e.key === 'D' || e.key === 'd'){
        type = 'Attack__'
    }
})
