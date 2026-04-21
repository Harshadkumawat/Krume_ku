import { useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { reset } from "../features/auth/authSlice";

/**
 *
 */
const ScrollToTop = memo(() => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reset());

    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, [pathname, dispatch]);

  return null;
});

ScrollToTop.displayName = "ScrollToTop";

export default ScrollToTop;
