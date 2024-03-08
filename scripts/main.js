window.addEventListener('load', () => {

    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');
    canvas.width = 1300;
    canvas.height = 720;

    let score = 0;
    let gameOver = false;

    class InputHandler{

        constructor(){
            this.keys = [];
            this.touchY = '';
            this.touchX = '';
            this.touchTreshold = 30;

            // Keyboard Events
            window.addEventListener('keydown', (e) => {
                if( (e.key === 'ArrowRight' || 
                    e.key === 'ArrowUp' || 
                    e.key === 'ArrowDown' || 
                    e.key === 'ArrowLeft'  ||
                    e.key === 'D' || e.key === 'd' ||
                    e.key === 'A' || e.key === 'a') && 
                    this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                } else if(e.key === 'Enter' && gameOver){
                    restartGame();
                }
            });

            window.addEventListener('keyup', (e)=>{
                if(e.key === 'ArrowRight'|| e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft'||
                e.key === 'D' || e.key === 'd' || e.key === 'A' || e.key === 'a'){
                    this.keys.splice(this.keys.indexOf(e.key),1);
                }
            });


            // Touch Events
            window.addEventListener('touchstart', (e) => {
                this.touchY = e.changedTouches[0].pageY;
                this.touchX = e.changedTouches[0].pageX;
            });

            window.addEventListener('touchmove', (e) => {
                const swipeDistanceY = e.changedTouches[0].pageY - this.touchY;
                const swipeDistanceX = e.changedTouches[0].pageX - this.touchX;
                if(swipeDistanceY < -this.touchTreshold && this.keys.indexOf('ArrowUp') === -1) {
                    this.keys.push('ArrowUp');
                } else if(swipeDistanceY > this.touchTreshold && this.keys.indexOf('ArrowDown') === -1) {
                    if(gameOver) restartGame();
                    this.keys.push('ArrowDown');
                }
                
                if(swipeDistanceX > this.touchTreshold && this.keys.indexOf('ArrowRight') === -1) {
                    this.keys.push('ArrowRight');
                } else if(swipeDistanceX < -this.touchTreshold && this.keys.indexOf('ArrowLeft') === -1) {
                    this.keys.push('ArrowLeft');
                }


            });

            window.addEventListener('touchend', (e) => {
                this.keys.splice(this.keys.indexOf('ArrowUp'),1);
                this.keys.splice(this.keys.indexOf('ArrowDown'),1);
                this.keys.splice(this.keys.indexOf('ArrowRight'),1);
                this.keys.splice(this.keys.indexOf('ArrowLeft'),1);
            });
    
        }
    }
    
    class Player{
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight
            this.width = 150
            this.height = 150
            this.x = 100
            this.y = this.gameHeight - this.height
            this.type = 'Idle__'
            this.frame = 0
            this.speed = 0
            this.vy = 0
            this.weight = 2
            this.fps = 20
            this.frameTimer = 0
            this.frameInterval = 1000/this.fps
            this.types = ['Idle__', 'Run__', 'Jump__', 'Attack__', 'Throw__', 'Glide_', 'Jump_Attack__']
            this.images = {}
            this.loadImages()
        }
    
        restart(){
            this.x = 100
            this.y = this.gameHeight - this.height
            this.type = 'Idle__'
            this.frame = 0
            this.frameTimer = 0
            this.speed = 0
            this.vy = 0
        }

        loadImages() {
            this.types.forEach(type => {
                this.images[type] = [];
                for (let i = 0; i <= 9; i++) {
                    const image = new Image();
                    image.src = `./images/character/ninja/${type}00${i}.png`;
                    this.images[type].push(image);
                }
            });
        }
    
        draw(context){
            this.frame = this.frame%10;
            context.drawImage(this.images[this.type][this.frame], this.x,this.y, 150, 150);
        }
    
        update(input, deltaTime, enemies){
    
            // collision detection
            enemies.forEach((enemy)=>{
                const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < enemy.width/4 + this.width/4 && enemy.isDead === false){
                    gameOver = true;
                }
            });
    
            // Player Animation
            if(this.frameTimer > this.frameInterval){
                this.frame++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
    
            // Player Movement
            if(input.keys.indexOf('ArrowRight') !== -1){
                this.type = 'Run__'
                this.speed = 5
            } else if(input.keys.indexOf('ArrowLeft') !== -1){
                this.type = 'Run__'
                this.speed = -5
            } else if(input.keys.indexOf('ArrowUp') !== -1){
                this.type = 'Jump__'
                if(this.onground()) this.vy -= 40
            } else if(input.keys.indexOf('D') !== -1 || input.keys.indexOf('d') !== -1){
                this.type = 'Attack__'
                this.speed = 0
            } else if(input.keys.indexOf('A') !== -1 || input.keys.indexOf('a') !== -1){
                this.type = 'Throw__'
                this.speed = 0
            }else{
                this.type = 'Idle__'
                this.speed = 0
            }
            
            // Horizontal Movement
            this.x += this.speed
            // Dont let the player go out of the screen
            if(this.x < 0) this.x= 0
            else if(this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
            
            // Vertical Movement
            this.y += this.vy
            if(!this.onground()){
                // Change the type of the player to Jump or Glide
                if(this.vy < 0 && this.speed > 0){
                    this.type = 'Glide_'
                    this.vy += this.weight/4
                } else if(input.keys.indexOf('D') !== -1 || input.keys.indexOf('d') !== -1){
                    this.type = 'Jump_Attack__'
                } else{
                    // Apply gravity
                    this.type = 'Jump__'
                    this.vy += this.weight
                }
            } else{
                this.vy = 0
            }
    
            // Dont let the player go out of the screen
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
            this.speed = 2
            this.image = new Image();
            this.image.src = './images/map/darkforest.png';
        }

        restart(){
            this.x = 0
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        
        update(){
            this.x -= this.speed
            if(this.x < 0 - this.width - this.speed) this.x = 0
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
            this.frame = 1
            this.speed = 5
            this.fps = 5
            this.frameTimer = 0
            this.frameInterval = 1000/this.fps
            this.typeframe = 10
            this.isDead = false
            this.images = {}
            this.loadImages()
        }
    
        loadImages() {
            this.images = [];
            for (let i = 1; i <= this.typeframe; i++) {
                const image = new Image();
                image.src = `./images/character/zombie/Walk (${i}).png`;
                this.images.push(image);
            }
        }
    
        draw(context){
            this.frame = this.frame === this.typeframe ? 1 : this.frame;
            
            context.drawImage(this.images[this.frame], this.x,this.y, 200, 200);
        }
    
        update(deltaTime){
            if(this.frameTimer > this.frameInterval){
                this.frame++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
    
            this.x-=this.speed;
        }
    }

    class Corpse{
        constructor(gameWidth, gameHeight, x, y){
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight
            this.width = 200
            this.height = 200
            this.x = x
            this.y = y
            this.type = 'Dead'
            this.frame = 1
            this.fps = 5
            this.frameTimer = 0
            this.frameInterval = 1000/this.fps
            this.frame = 1
            this.removeTimer = 0
            this.images = []
            this.loadImages()
        }

        loadImages() {
            for (let i = 1; i <= 12; i++) {
                const image = new Image();
                image.src = `./images/character/zombie/Dead (${i}).png`;
                this.images.push(image);
            }
        }
    
        draw(context){
            this.frame = this.frame > 11 ? 11 : this.frame;
            
            context.drawImage(this.images[this.frame], this.x,this.y, 200, 200);
        }
    
        update(deltaTime){
            if(this.frameTimer > this.frameInterval){
                this.frame++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
            this.removeTimer++;
        }
    }

    function displayStatus(context){
        context.fillStyle = 'black';
        context.font = '40px Arial';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'white';
        context.font = '40px Arial';
        context.fillText('Score: ' + score, 22, 52);
        if(gameOver){
            context.fillStyle = 'black';
            context.font = '40px Arial';
            const text = 'Game Over, press Enter or Swipe Down to restart!';
            const textWidth = context.measureText(text).width;
            context.fillText(text, (CANVAS_WIDTH - textWidth)/2, (CANVAS_HEIGHT + 40)/2);
            context.fillStyle = 'white';
            context.font = '40px Arial';
            context.fillText(text, (CANVAS_WIDTH - textWidth)/2 + 4, (CANVAS_HEIGHT + 40)/2 + 4);
        }
    }

    let enemies = [];
    let corpses = []

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
        if(enemyTimer > interval  + randomEnemyInterval){
            enemies.push(new Enemy(CANVAS_WIDTH, CANVAS_HEIGHT));
            randomEnemyInterval = Math.floor(Math.random() * 1000) + 1000;
            enemyTimer = 0;
        } else{
            enemyTimer += deltaTime;
        }

        enemies.forEach((enemy)=>{
            if(enemy.x < 0 - enemy.width) enemies.splice(enemies.indexOf(enemy), 1);
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
    }

    function handleCorpses(deltaTime){
        corpses.forEach((corpse)=>{
            if(corpse.removeTimer > 100) corpses.splice(corpses.indexOf(corpse), 1);
            corpse.draw(ctx);
            corpse.update(deltaTime);
        });
    }

    function handleAttack(){
        if(input.keys.indexOf('D') !== -1 || input.keys.indexOf('d') !== -1){
            enemies.forEach((enemy)=>{
                if(player.x + player.width >= enemy.x && player.x <= enemy.x + enemy.width && player.y + player.height >= enemy.y && player.y <= enemy.y + enemy.height && enemy.isDead === false){
                    corpses.push(new Corpse(CANVAS_WIDTH, CANVAS_HEIGHT,enemy.x,enemy.y));
                    score++;
                    enemies.splice(enemies.indexOf(enemy), 1);
                }
            })
        } 
    }

    function restartGame(){
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    document.getElementById("attack").addEventListener('touchstart', function() {
        if(input.keys.indexOf('D') === -1){
            input.keys.push('D');
        }
        enemies.forEach((enemy)=>{
            if(player.x + player.width >= enemy.x && player.x <= enemy.x + enemy.width && player.y + player.height >= enemy.y && player.y <= enemy.y + enemy.height && enemy.isDead === false){
                corpses.push(new Corpse(CANVAS_WIDTH, CANVAS_HEIGHT,enemy.x,enemy.y));
                score++;
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        });
    });

    document.getElementById("attack").addEventListener('touchend', function() {
        if(input.keys.indexOf('D') !== -1) input.keys.splice(input.keys.indexOf('D'),1);
    });


    function animate(timeStamp){
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input,deltaTime,enemies);
        
        handleAttack();
        handleEnemies(deltaTime);
        handleCorpses(deltaTime);
        displayStatus(ctx);
        if(!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
    
});