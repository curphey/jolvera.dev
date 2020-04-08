import PropTypes from "prop-types";
import Link from "./link";
import { Flex } from "rebass";
import NextIcon from "../static/next.svg";

const NextPrevPost = ({ title, slug, position }) => {
  const isNext = position === "next";
  return (
    <>
      <Link
        href={slug}
        sx={{
          textAlign: isNext ? "right" : "left",
          gridColumn: isNext && "2/2"
        }}
      >
        <Flex
          as="small"
          alignItems="center"
          justifyContent="flex-end"
          flexDirection={!isNext && "row-reverse"}
          mb={2}
        >
          Read {position} post{" "}
          {isNext ? (
            <NextIcon />
          ) : (
            <NextIcon style={{ transform: "rotate(180deg)" }} />
          )}
        </Flex>
        {title}
      </Link>
    </>
  );
};

NextPrevPost.propTypes = {
  title: PropTypes.string.isRequired,
  slug: PropTypes.string,
  position: PropTypes.oneOf(["next", "previous"])
};

export default NextPrevPost;
