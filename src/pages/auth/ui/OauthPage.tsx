import { useEffect } from "react";
import { getUserThunkPwa } from "../../../entities/user/api/userApi";
import { MobileShell } from "../../../widgets/mobile-shell/ui/MobileShell";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store/store";

export function OauthPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (isAuth) {
      navigate("/app/today", { replace: true });
    }

    if (code && state) {
      dispatch(getUserThunkPwa({ code, state }));
      return;
    }
  }, [searchParams, isAuth, dispatch, navigate]);

  return (
    <MobileShell>
      <section className="flex flex-col px-4  flex-1 overflow-auto  h-full gap-5 bg-white"></section>
    </MobileShell>
  );
}
