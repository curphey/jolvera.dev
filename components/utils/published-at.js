import React from "react";
import Link from "../link";
import { parse, format } from "date-fns";

function PublishedAt(props) {
  const { link, date } = props;
  return (
    <Link href={`/posts/${link}`} className="u-url" mb={0} {...props}>
      <time className="dt-published">
        {format(parse(date), "MMMM DD, YYYY")}
      </time>
    </Link>
  );
}

export default PublishedAt;
