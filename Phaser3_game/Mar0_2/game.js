var SceneA = new Phaser.Class({

    LEVEL_WIDTH:1600,
    LEVEL_HEIGHT:416,

    Extends: Phaser.Scene,

    initialize:

    function SceneA ()
    {
        Phaser.Scene.call(this, { key: 'sceneA' });
    },

    preload: function ()
    {
      this.load.image('tiles','assets/tilesets/monochrome_tilemap_transparent.png');
      this.load.image('spike','assets/Images/spike.png');
      this.load.image('enemy','assets/Images/enemy.png'); //change to atlas later
      this.load.image('goal','assets/Images/goal.png');
      this.load.image('enemy_collider','assets/Images/empty_sprite.png');
      this.load.image('collectable','assets/Images/collectable.png');
      this.load.atlas('player','assets/Images/player.png','assets/Images/player_atlas.json');
      this.load.tilemapTiledJSON('map','assets/tilemaps/level1.json');
    },

    create: function ()
    {
      //cameras
      this.cameras.main.setBounds(0,0,this.LEVEL_WIDTH,this.LEVEL_HEIGHT);

      //load level
      const map = this.make.tilemap({ key: 'map' });
      const tileset = map.addTilesetImage('kenney_monochrome', 'tiles');

      //Platforms
      const platforms = map.createLayer('Platforms', tileset, 0, 200);
      platforms.setCollisionByExclusion(-1, true);

      //player
      const player = map.getObjectLayer('Player').objects;
      this.player = this.physics.add.sprite(player[0].x,player[0].y + 200 - player[0].height,'player').setOrigin(0);
      this.player.setBounce(0.1);
      this.player.setCollideWorldBounds(false);

      //camera
      this.cameras.main.startFollow(this.player,true);

      //spikes
      this.spikes = this.physics.add.group({
       allowGravity: false,
       immovable: true
      });

      map.getObjectLayer('Spikes').objects.forEach((spike) => {
       const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
      });

      this.enemies = this.physics.add.group({
        allowGravity: true,
        immovable: false
      })

      map.getObjectLayer('Enemies').objects.forEach((enemy) => {
        const enemySprite = this.enemies.create(enemy.x, enemy.y + 200 - enemy.height, 'enemy').setOrigin(0);
      });

      this.enemies.getChildren().forEach((enemy) => {
          enemy.setVelocityX(100);
      });

      //enemy_colliders
      this.enemy_colliders = this.physics.add.group({
        allowGravity: false,
        immovable: true
      })

      map.getObjectLayer('Enemy_collider').objects.forEach((collider) => {
          const enemyCollider = this.enemy_colliders.create(collider.x,collider.y+200 -collider.height,'enemy_collider').setOrigin(0);
      });

      //Collectables
      this.collectables = this.physics.add.group({
        allowGravity: false,
        immovable: true
      })

      map.getObjectLayer('Collectables').objects.forEach((collectable) => {
          const coin = this.collectables.create(collectable.x,collectable.y+200 -collectable.height,'collectable').setOrigin(0);
      });

      //End_goal

      this.end_goals = this.physics.add.group({
        allowGravity: false,
        immovable: true
      });

      map.getObjectLayer('End_goal').objects.forEach((goal) => {
          const goalSprite = this.end_goals.create(goal.x,goal.y+200 - goal.height,'goal').setOrigin(0);
      });

      this.anims.create({
      key: 'player_walk',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'tile_0',
        start: 241,
        end: 243,
      }),
      frameRate: 10,
      repeat: -1
      });

      this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player', frame: 'tile_0240' }],
      frameRate: 10,
      });

      this.anims.create({
      key: 'player_dead',
      frames: [{ key: 'player', frame: 'tile_0246' }],
      frameRate: 10,
      });

      this.anims.create({
      key: 'player_jump',
      frames: [{ key: 'player', frame: 'tile_0245' }],
      frameRate: 10,
      });

      //colliders
      this.physics.add.collider(this.player, platforms);
      this.physics.add.collider(this.enemies, platforms);
      this.physics.add.collider(this.enemies, this.enemy_colliders,  enemyLogic, null, this);
      this.physics.add.collider(this.player, this.spikes, playerHit, null, this);
      this.physics.add.collider(this.player, this.enemies, playerEnemyCollision, null, this);
      this.physics.add.overlap(this.player, this.collectables, playerCollect, null);
      this.physics.add.overlap(this.player, this.end_goals, levelEnd,null, this);

      livesText = this.add.text(16, 16, 'lives: 3', { fontSize: '16px', fill: '#fff' });
      scoreText = this.add.text(16, 33, 'score: 0', { fontSize: '16px', fill: '#fff' });

      this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function ()
    {
      if (gameOver)
      {
          this.player.play('player_dead', true);
          return;
      }

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-100);
        if (this.player.body.onFloor()) {
          this.player.play('player_walk', true);
        }
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(100);
        if (this.player.body.onFloor()) {
          this.player.play('player_walk', true);
        }
      } else {
        this.player.setVelocityX(0);
        if (this.player.body.onFloor()) {
          this.player.play('player_idle', true);
        }
      }
      if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
        this.player.setVelocityY(-200);
        this.player.play('player_jump', true);
      }
      if (this.player.body.velocity.x > 0) {
        this.player.setFlipX(false);
      } else if (this.player.body.velocity.x < 0) {
        this.player.setFlipX(true);
      }

      livesText.x = this.cameras.main.worldView.x + 16;
      scoreText.x = this.cameras.main.worldView.x + 16;

      scoreText.setText("score: " + score);
      livesText.setText("lives: " + player_lives);
    }

});

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  parent: 'game',
  width: 800,
  height: 640,
  /*scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },*/
  scene: [SceneA],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y:500},
    },
  },
};

const game = new Phaser.Game(config);

var player_lives = 3;
var livesText;
var gameOver = false;
var score = 0;

function playerHit(player, spike){
  player.setVelocity(0,0);
  player.setX(50);
  player.setY(240);
  player.play('player_idle', true);
  player.setAlpha(0);

  player_lives -= 1;
  if(player_lives > 0){

  let tw = this.tweens.add({
    targets: player,
    alpha: 1,
    duration: 100,
    ease: 'Linear',
    repeat: 5,
  });

} else {
    livesText.setText("lives: " + 0);
    gameOver = true;
  }
}

function enemyLogic(enemy,enemy_collider){
    let collider = enemy.body.touching;
    let current_enemy_speed = enemy.body.velocity;
    if(collider.right){
      enemy.setVelocityX(-100);
    }
    if(collider.left){
      enemy.setVelocityX(100);
    }
}

  function playerEnemyCollision(player,enemy){
      let collider = enemy.body.touching;
      let player_collision = player.body.touching;
      let current_enemy_speed = enemy.body.velocity;
      if((collider.left || collider.right) && player_collision){
        player_lives -= 1;

        if(player_lives > 0){
        player.setVelocity(0,0);
        player.setX(50);
        player.setY(240);
        player.play('player_idle', true);
        player.setAlpha(0);

        let tw = this.tweens.add({
          targets: player,
          alpha: 1,
          duration: 100,
          ease: 'Linear',
          repeat: 5,
        });

      } else {
          gameOver = true;
        }
        enemy.setVelocityX(100);
      }

      if(collider.up && player_collision.down){
          score += 30;
          enemy.destroy();
      }
  }

  function playerCollect(player, collectable){
    collectable.disableBody(true, true);
    score += 10;
  }

  function levelEnd(player,goal){
      this.scene.pause();
  }
