interface PieProps {
  className?: string
  width?: number
  height?: number
}

const Pie = ({ className, height, width }: PieProps) => {
  return (
    <svg
      className={className}
      fill="#16a34a"
      height={height ?? 80}
      width={width ?? 80}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 59.872 59.872"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        {" "}
        <g>
          {" "}
          <path d="M57.236,42.429l0.373-0.963c3.038-7.848,2.842-16.723-0.54-24.351C53.978,10.143,48.5,4.853,41.642,2.219 C25.674-3.915,8.404,3.077,2.331,18.142C-3.826,33.415,3.305,51.053,18.227,57.46c3.743,1.607,7.704,2.412,11.68,2.412 c3.75,0,7.515-0.716,11.123-2.149l0.935-0.372L31.526,31.515L57.236,42.429z M31.999,38.023c-0.126,0.167-0.215,0.366-0.215,0.592 c0,0.497,0.37,0.892,0.845,0.969l2.865,7.09c-0.408,0.126-0.71,0.492-0.71,0.941c0,0.552,0.448,1,1,1 c0.163,0,0.311-0.048,0.447-0.117l2.904,7.188c-0.11-0.042-0.227-0.071-0.351-0.071c-0.552,0-1,0.448-1,1 c0,0.037,0.017,0.068,0.021,0.104c-5.283,1.56-10.817,1.529-16.025-0.083c0-0.007,0.004-0.013,0.004-0.02c0-0.552-0.448-1-1-1 c-0.324,0-0.599,0.165-0.782,0.404c-0.33-0.127-0.659-0.256-0.985-0.396c-6.26-2.688-11.044-7.499-13.9-13.274 c0.177,0.161,0.408,0.266,0.667,0.266c0.552,0,1-0.448,1-1s-0.448-1-1-1c-0.552,0-1,0.448-1,1c0,0.031,0.015,0.057,0.018,0.087 c-0.41-0.884-0.775-1.788-1.094-2.71c0.047-0.116,0.076-0.243,0.076-0.376c0-0.35-0.191-0.644-0.464-0.822 c-0.414-1.388-0.719-2.812-0.921-4.255c0.118,0.049,0.248,0.078,0.384,0.078c0.552,0,1-0.448,1-1s-0.448-1-1-1 c-0.217,0-0.407,0.083-0.57,0.201c-0.115-1.458-0.121-2.932-0.01-4.408c0.166,0.122,0.359,0.208,0.581,0.208c0.552,0,1-0.448,1-1 s-0.448-1-1-1c-0.146,0-0.282,0.034-0.406,0.09c0.194-1.423,0.5-2.844,0.918-4.251c0.287-0.176,0.489-0.478,0.489-0.839 c0-0.146-0.035-0.282-0.091-0.407c0.153-0.441,0.317-0.88,0.493-1.318c0.19-0.47,0.405-0.921,0.617-1.374 c-0.004,0.034-0.02,0.064-0.02,0.099c0,0.552,0.448,1,1,1c0.552,0,1-0.448,1-1s-0.448-1-1-1c-0.273,0-0.519,0.111-0.699,0.288 c2.645-5.29,6.864-9.337,11.91-11.873c-0.124,0.167-0.211,0.362-0.211,0.585c0,0.552,0.448,1,1,1c0.552,0,1-0.448,1-1 c0-0.542-0.433-0.978-0.971-0.994c0.873-0.403,1.773-0.751,2.688-1.063c0.091,0.028,0.183,0.057,0.283,0.057 c0.327,0,0.604-0.168,0.786-0.411c1.391-0.414,2.822-0.724,4.281-0.925c-0.038,0.106-0.068,0.216-0.068,0.335c0,0.552,0.448,1,1,1 c0.552,0,1-0.448,1-1c0-0.196-0.071-0.368-0.169-0.523c0.741-0.056,1.486-0.09,2.237-0.09c0.698,0,1.401,0.033,2.105,0.082 c-0.1,0.156-0.173,0.331-0.173,0.53c0,0.552,0.448,1,1,1c0.552,0,1-0.448,1-1c0-0.127-0.029-0.246-0.072-0.357 c1.404,0.182,2.814,0.463,4.22,0.849c0.173,0.298,0.483,0.508,0.852,0.508c0.164,0,0.313-0.049,0.449-0.119 c0.565,0.182,1.13,0.375,1.693,0.591c6.357,2.441,11.44,7.357,14.315,13.84c0.296,0.667,0.557,1.347,0.801,2.032 c-0.156,0.177-0.259,0.402-0.259,0.656c0,0.475,0.338,0.854,0.782,0.956c0.414,1.42,0.723,2.869,0.92,4.334 c-0.181-0.178-0.428-0.29-0.702-0.29c-0.552,0-1,0.448-1,1s0.448,1,1,1c0.361,0,0.662-0.201,0.838-0.487 c0.156,1.673,0.168,3.359,0.043,5.038c-0.166-0.323-0.493-0.551-0.881-0.551c-0.552,0-1,0.448-1,1s0.448,1,1,1 c0.329,0,0.607-0.169,0.789-0.414c-0.162,1.489-0.438,2.967-0.823,4.421c-0.535,0.019-0.966,0.453-0.966,0.993 c0,0.336,0.177,0.62,0.432,0.801c-0.04,0.119-0.074,0.24-0.115,0.358l-7.811-3.316c0.29-0.175,0.495-0.479,0.495-0.843 c0-0.552-0.448-1-1-1c-0.552,0-1,0.448-1,1c0,0.079,0.028,0.149,0.045,0.223l-7.088-3.009c0.016-0.071,0.043-0.138,0.043-0.214 c0-0.552-0.448-1-1-1c-0.349,0-0.641,0.189-0.82,0.46l-10.101-4.288L31.999,38.023z" />{" "}
          <path d="M59.685,46.391l-0.212-0.475L35.826,35.878l9.36,23.166l0.227,0.464l0.892,0.312l0.386-0.181 c5.562-2.545,10.158-6.932,12.946-12.361C59.773,47.003,59.792,46.68,59.685,46.391z M46.687,57.422l-7.198-17.815l17.913,7.604 C54.942,51.581,51.186,55.161,46.687,57.422z" />{" "}
          <circle cx="23.784" cy="5.615" r="1" />{" "}
          <circle cx="26.784" cy="8.615" r="1" />{" "}
          <circle cx="29.784" cy="5.615" r="1" />{" "}
          <circle cx="20.784" cy="8.615" r="1" />{" "}
          <circle cx="14.784" cy="8.615" r="1" />{" "}
          <circle cx="32.784" cy="8.615" r="1" />{" "}
          <circle cx="35.784" cy="5.615" r="1" />{" "}
          <circle cx="41.784" cy="5.615" r="1" />{" "}
          <circle cx="23.784" cy="11.615" r="1" />{" "}
          <circle cx="29.784" cy="11.615" r="1" />{" "}
          <circle cx="17.784" cy="11.615" r="1" />{" "}
          <circle cx="11.784" cy="11.615" r="1" />{" "}
          <circle cx="47.784" cy="11.615" r="1" />{" "}
          <circle cx="35.784" cy="11.615" r="1" />{" "}
          <circle cx="41.784" cy="11.615" r="1" />{" "}
          <circle cx="38.784" cy="8.615" r="1" />{" "}
          <circle cx="44.784" cy="8.615" r="1" />{" "}
          <circle cx="23.784" cy="17.615" r="1" />{" "}
          <circle cx="26.784" cy="14.615" r="1" />{" "}
          <circle cx="26.784" cy="20.615" r="1" />{" "}
          <circle cx="29.784" cy="17.615" r="1" />{" "}
          <circle cx="17.784" cy="17.615" r="1" />{" "}
          <circle cx="20.784" cy="14.615" r="1" />{" "}
          <circle cx="20.784" cy="20.615" r="1" />{" "}
          <circle cx="11.784" cy="17.615" r="1" />{" "}
          <circle cx="8.784" cy="14.615" r="1" />{" "}
          <circle cx="14.784" cy="14.615" r="1" />{" "}
          <circle cx="8.784" cy="20.615" r="1" />{" "}
          <circle cx="14.784" cy="20.615" r="1" />{" "}
          <circle cx="53.784" cy="17.615" r="1" />{" "}
          <circle cx="47.784" cy="17.615" r="1" />{" "}
          <circle cx="50.784" cy="14.615" r="1" />{" "}
          <circle cx="50.784" cy="20.615" r="1" />{" "}
          <circle cx="32.784" cy="14.615" r="1" />{" "}
          <circle cx="32.784" cy="20.615" r="1" />{" "}
          <circle cx="35.784" cy="17.615" r="1" />{" "}
          <circle cx="41.784" cy="17.615" r="1" />{" "}
          <circle cx="23.784" cy="23.615" r="1" />{" "}
          <circle cx="29.784" cy="23.615" r="1" />{" "}
          <circle cx="17.784" cy="23.615" r="1" />{" "}
          <circle cx="5.784" cy="23.615" r="1" />{" "}
          <circle cx="11.784" cy="23.615" r="1" />{" "}
          <circle cx="53.784" cy="23.615" r="1" />{" "}
          <circle cx="47.784" cy="23.615" r="1" />{" "}
          <circle cx="35.784" cy="23.615" r="1" />{" "}
          <circle cx="41.784" cy="23.615" r="1" />{" "}
          <circle cx="38.784" cy="14.615" r="1" />{" "}
          <circle cx="44.784" cy="14.615" r="1" />{" "}
          <circle cx="38.784" cy="20.615" r="1" />{" "}
          <circle cx="44.784" cy="20.615" r="1" />{" "}
          <circle cx="23.784" cy="29.615" r="1" />{" "}
          <circle cx="26.784" cy="26.615" r="1" />{" "}
          <circle cx="26.784" cy="32.615" r="1" />{" "}
          <circle cx="17.784" cy="29.615" r="1" />{" "}
          <circle cx="20.784" cy="26.615" r="1" />{" "}
          <circle cx="20.784" cy="32.615" r="1" />{" "}
          <circle cx="5.784" cy="29.615" r="1" />{" "}
          <circle cx="11.784" cy="29.615" r="1" />{" "}
          <circle cx="8.784" cy="26.615" r="1" />{" "}
          <circle cx="14.784" cy="26.615" r="1" />{" "}
          <circle cx="8.784" cy="32.615" r="1" />{" "}
          <circle cx="14.784" cy="32.615" r="1" />{" "}
          <circle cx="53.784" cy="29.615" r="1" />{" "}
          <circle cx="47.784" cy="29.615" r="1" />{" "}
          <circle cx="50.784" cy="26.615" r="1" />{" "}
          <circle cx="50.784" cy="32.615" r="1" />{" "}
          <circle cx="32.784" cy="26.615" r="1" />{" "}
          <circle cx="35.784" cy="29.615" r="1" />{" "}
          <circle cx="41.784" cy="29.615" r="1" />{" "}
          <circle cx="23.784" cy="35.615" r="1" />{" "}
          <circle cx="29.784" cy="35.615" r="1" />{" "}
          <circle cx="17.784" cy="35.615" r="1" />{" "}
          <circle cx="5.784" cy="35.615" r="1" />{" "}
          <circle cx="11.784" cy="35.615" r="1" />{" "}
          <circle cx="53.784" cy="35.615" r="1" />{" "}
          <circle cx="38.784" cy="26.615" r="1" />{" "}
          <circle cx="44.784" cy="26.615" r="1" />{" "}
          <circle cx="44.784" cy="32.615" r="1" />{" "}
          <circle cx="23.784" cy="41.615" r="1" />{" "}
          <circle cx="26.784" cy="38.615" r="1" />{" "}
          <circle cx="26.784" cy="44.615" r="1" />{" "}
          <circle cx="29.784" cy="41.615" r="1" />{" "}
          <circle cx="17.784" cy="41.615" r="1" />{" "}
          <circle cx="20.784" cy="38.615" r="1" />{" "}
          <circle cx="20.784" cy="44.615" r="1" />{" "}
          <circle cx="11.784" cy="41.615" r="1" />{" "}
          <circle cx="8.784" cy="38.615" r="1" />{" "}
          <circle cx="14.784" cy="38.615" r="1" />{" "}
          <circle cx="8.784" cy="44.615" r="1" />{" "}
          <circle cx="14.784" cy="44.615" r="1" />{" "}
          <circle cx="32.784" cy="44.615" r="1" />{" "}
          <circle cx="23.784" cy="47.615" r="1" />{" "}
          <circle cx="29.784" cy="47.615" r="1" />{" "}
          <circle cx="17.784" cy="47.615" r="1" />{" "}
          <circle cx="11.784" cy="47.615" r="1" />{" "}
          <circle cx="23.784" cy="53.615" r="1" />{" "}
          <circle cx="26.784" cy="50.615" r="1" />{" "}
          <circle cx="26.784" cy="56.615" r="1" />{" "}
          <circle cx="29.784" cy="53.615" r="1" />{" "}
          <circle cx="17.784" cy="53.615" r="1" />{" "}
          <circle cx="20.784" cy="50.615" r="1" />{" "}
          <circle cx="14.784" cy="50.615" r="1" />{" "}
          <circle cx="32.784" cy="50.615" r="1" />{" "}
          <circle cx="32.784" cy="56.615" r="1" />{" "}
          <circle cx="35.784" cy="53.615" r="1" />{" "}
        </g>{" "}
      </g>
    </svg>
  )
}

export default Pie