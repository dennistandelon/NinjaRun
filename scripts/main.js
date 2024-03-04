class InputHandler{

    constructor(){
        this.keys = [];
        window.addEventListener('keydown', (e) => {
            if( e.key === 'ArrowRight' || 
                e.key === 'ArrowUp' || 
                e.key === 'ArrowDown' || 
                e.key === 'ArrowLeft'  ||
                e.key === 'D' ||
                e.key === 'd' && 
                this.keys.indexOf(e.key) === -1){
                this.keys.push(e.key);
            }
        });
        window.addEventListener('keyup', (e)=>{
            if(e.key === 'ArrowRight'|| 
            e.key === 'ArrowUp' || 
            e.key === 'ArrowDown' || 
            e.key === 'ArrowLeft'||
            e.key === 'D'||
            e.key === 'd'){
                this.keys.splice(this.keys.indexOf(e.key),1);
            }
        });

    }
}

class Player{
    constructor(gameWidth, gameHeight){
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
        this.width = 200
        this.height = 200
        this.x = 0
        this.y = this.gameHeight - this.height
        this.type = 'Idle__'
        this.frame = 0
        this.speed = 0
        this.vy = 0
        this.weight = 2
    }

    draw(context){

        const player = new Image();
        this.frame = this.frame%10;
        player.src = './images/character/ninja/' + this.type + '00' + this.frame + '.png';

        this.frame++;
        context.drawImage(player, this.x,this.y, 200, 200);
    }

    update(input){
        if(input.keys.indexOf('ArrowRight') !== -1){
            this.type = 'Run__'
            this.speed = 5
        } else if(input.keys.indexOf('ArrowLeft') !== -1){
            this.type = 'Run__'
            this.speed = -5
        } else if(input.keys.indexOf('ArrowUp') !== -1){
            this.type = 'Jump__'
            this.vy -= 10
        } else if(input.keys.indexOf('D') !== -1 || input.keys.indexOf('d') !== -1){
            this.type = 'Attack__'
        } else{
            this.type = 'Idle__'
            this.speed = 0
        }
        
        this.x += this.speed
        if(this.x < 0) this.x= 0
        else if(this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
        
        this.y += this.vy
        if(!this.onground()){
            if(this.vy < 0 && this.speed > 0){
                this.type = 'Glide_'
            }
            this.vy += this.weight
        } else{
            this.vy = 0
        }
        if(this.y > this.gameHeight - this.height){
            this.y = this.gameHeight - this.height
        } else if(this.y < 0){
            this.y = 0
        }
    }

    onground(){
        return this.y >= this.gameHeight - this.height
    }
}

class Background{
    constructor(gameWidth, gameHeight){
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
        this.width = 2400
        this.height = 720
        this.x = 0
        this.y = 0
        this.speed = 7
    }
    draw(context){
        const bg = new Image();
        bg.src = './images/map/darkforest.png';
        context.drawImage(bg, this.x, this.y, this.width, this.height);
        context.drawImage(bg, this.x + this.width - this.speed, this.y, this.width, this.height);
    }
    update(){
        this.x -= this.speed
        if(this.x < -this.width) this.x = 0
    }   
}

class Enemy{
    constructor(gameWidth, gameHeight){
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
        this.width = 200
        this.height = 200
        this.x = this.gameWidth
        this.y = this.gameHeight - this.height
        this.type = 'Walk'
        this.frame = 0
        this.speed = 5
    }

    draw(context){
        const enemy = new Image();
        this.frame = this.frame % 8;
        enemy.src = './images/character/zombie/male/' + this.type + ' (' + this.frame + ').png';

        this.frame++;
        context.drawImage(enemy, this.x,this.y, 200, 200);
    }

    update(){
        this.x-=this.speed;
    }
}

window.addEventListener('load', () => {

    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;

    const enemies = [];

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    
    const input = new InputHandler();
    const player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT);
    const background = new Background(CANVAS_WIDTH, CANVAS_HEIGHT);

    enemies.push(new Enemy(CANVAS_WIDTH, CANVAS_HEIGHT));

    let lastTime = 0;
    let enemyTimer = 0;
    let interval = 1000;
    let randomEnemyInterval = Math.floor(Math.random() * 1000) + 1000;
    
    function handleEnemies(deltaTime){
        if(enemyTimer > interval + randomEnemyInterval){
            enemies.push(new Enemy(CANVAS_WIDTH, CANVAS_HEIGHT));
            randomEnemyInterval = Math.floor(Math.random() * 1000) + 1000;
            enemyTimer = 0;
        } else{
            enemyTimer += deltaTime;
        }

        enemies.forEach((enemy)=>{
            enemy.draw(ctx);
            enemy.update();
        })
    }


    function animate(timeStamp){
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input);
        
        handleEnemies(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
    
});