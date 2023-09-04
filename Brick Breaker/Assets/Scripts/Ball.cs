using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ball : MonoBehaviour
{
    public new Rigidbody2D rigidbody;
    public float speed = 10f;
    public Paddle paddleScript;
    public GameObject paddle;
    bool addedForce = false;
    public bool isRed;
    public ParticleSystem ps;
    public bool isDead;

    public SpriteRenderer spriteRenderer;

    private Vector2 force = Vector2.zero;

    private void Awake()
    {
        rigidbody = gameObject.GetComponent<Rigidbody2D>();
        paddleScript = paddle.GetComponent<Paddle>();
        ps = GetComponent<ParticleSystem>();
        isDead = false;

        float startingColor = Random.Range(0f, 1f);
        if (startingColor < 0.5)
        {
            isRed = true;
        } else
        {
            isRed = false;
        }

        if (isRed)
        {
            spriteRenderer.color = new Color(0.9960785f, 0.007843138f, 0f);
        } else
        {
            spriteRenderer.color = new Color(0.2313726f, 0.4705883f, 0.8470589f);
        }
    }

    private void Update() 
    {   
        if (addedForce == false)
        {
            paddleScript.gameStarted = false;
        }

        if (isRed)
        {
            spriteRenderer.color = new Color(0.9960785f, 0.007843138f, 0f);
        } else
        {
            spriteRenderer.color = new Color(0.2313726f, 0.4705883f, 0.8470589f);
        }
        
        force.y = 1f;
        if ((Input.GetKeyDown(KeyCode.LeftArrow) || Input.GetKeyDown(KeyCode.A)) && (paddleScript.gameStarted == false))
        {
            force.x = -1f;
            paddleScript.gameStarted = true;
        } else if ((Input.GetKeyDown(KeyCode.RightArrow) || Input.GetKeyDown(KeyCode.D)) && (paddleScript.gameStarted == false))
        {
            force.x = 1f;
            paddleScript.gameStarted = true;
        }
        
        if (paddleScript.gameStarted && addedForce == false)
        {
            addedForce = true;
            rigidbody.AddForce(force.normalized * speed);
        }

        //death
        bool dead = false;
        if (transform.position.y < -10.3f && !dead)
        {
            isDead = true;
            this.rigidbody.velocity = Vector2.zero;
            if (isRed)
            {
                ps.startColor = new Color(0.9960785f, 0.007843138f, 0f);
            } else
            {
                ps.startColor = new Color(0.2313726f, 0.4705883f, 0.8470589f);
            }
            ps.Play();
        }

    }
}
