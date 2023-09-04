using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Brick : MonoBehaviour
{
    private int health = 4;
    public SpriteRenderer spriteRenderer;
    public Sprite[] states;
    public bool unbreakable;
    public bool redBrick;
    public bool powerUpBrick;

    public GameObject ball;
    public Ball ballScript;
    public GameObject powerUpBall;
    public Sprite unbreakableSprite;
    public Sprite powerUpSprite;

    void Awake()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
        ballScript = ball.GetComponent<Ball>();
    }

    private void Start() 
    {
        if (!unbreakable && !powerUpBrick)
        {
            health = states.Length;
            spriteRenderer.sprite = states[health - 1];
        } else if (powerUpBrick)
        {
            spriteRenderer.sprite = powerUpSprite;
        } else if (powerUpBrick)
        {
            spriteRenderer.sprite = powerUpSprite;
        } else
        {
            // spriteRenderer.sprite = unbreakableSprite;
        }
    }

    private void Hit()
    {        
        if (unbreakable)
        {
            return;
        } else if (powerUpBrick)
        {
            PowerUpHit();
            return;
        }

        if ((ballScript.isRed && redBrick) || (!ballScript.isRed && !redBrick))
        {
            gameObject.SetActive(false);
            return;
        }

        health--;
        
        if (health <= 0)
        {
            gameObject.SetActive(false);
        } else 
        {
            spriteRenderer.sprite = states[health - 1];
        }
    }

    private void PowerUpHit()
    {
        PowerUp powerUpScript = powerUpBall.GetComponent<PowerUp>();
        
        powerUpScript.startPos = transform.position;
        Instantiate(powerUpBall);
        gameObject.SetActive(false);
    }

    private void OnCollisionEnter2D(Collision2D other)
    {
        Ball ball = other.gameObject.GetComponent<Ball>();
        
        if (ball != null)
        {
            Hit();
        }
    }
}
