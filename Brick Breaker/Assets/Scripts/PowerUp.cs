using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PowerUp : MonoBehaviour
{
    public Vector2 startPos;
    public float speed = 1f;
    public Sprite[] powerUps;
    public SpriteRenderer sr;
    void Awake()
    {
        sr = gameObject.GetComponent<SpriteRenderer>();
        sr.sprite = powerUps[Random.Range(0, powerUps.Length)];
        transform.position = startPos;
    }

    void FixedUpdate()
    {
        transform.Translate(Vector3.down * speed);
    }

    void Update()
    {
        if (transform.position.y < -11)
        {
            Destroy(gameObject);
        }
    }
}
